// MP 逻辑 e2e — 拆 file 拿 Page object 然后 onShow 跑
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import vm from 'node:vm'

const MP = '/root/claude/GridGo/apps/mp'
const OUT = path.resolve(MP, 'tests/visual-results')

// 抽 Page({...}) 对象 - 非贪婪跨多行
function extractPageBlock(jsCode) {
  // 找 'Page(' 然后 { ... 匹配对应 } ，再 )
  const start = jsCode.indexOf('Page(')
  if (start < 0) return null
  // 找 { 然后深度匹配 }
  let i = start + 5
  let depth = 0
  let foundStart = -1
  let foundEnd = -1
  for (; i < jsCode.length; i++) {
    if (jsCode[i] === '{') { if (foundStart < 0) foundStart = i; depth++ }
    else if (jsCode[i] === '}') { depth--; if (depth === 0) { foundEnd = i; break } }
  }
  if (foundStart < 0 || foundEnd < 0) return null
  return jsCode.slice(foundStart, foundEnd + 1)
}

// 把 ESM import 干掉（用 mock 替换）
function stripImports(jsCode) {
  let out = jsCode
  // import * as api from '...' → const api = {...}
  out = out.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"][^'"]+['"];?/g, (_, name) => {
    return `const ${name} = { listTasks: async() => [{id:"1",title:"T",done:false,quadrant:"q1",due_date:"2026-06-28",estimate_min:30,okr_id:"o1"}], listOkrs: async() => [{id:"o1",title:"O",category:"product",progress:0.5}], toggleTask: async() => ({}), signIn: async() => ({access_token:"m"}), signUp: async() => ({}), createTask: async(t) => ({...t, id:"n1", user_id:"u"}), updateTask: async() => ({}), deleteTask: async() => ({}), createOkr: async() => ({}), deleteOkr: async() => ({}) }`
  })
  // import { x } from '...' → const x = ... (noop)
  out = out.replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?/g, '')
  return out
}

async function runPage(pageName) {
  let jsCode = await readFile(`${MP}/pages/${pageName}/${pageName}.js`, 'utf-8')
  jsCode = stripImports(jsCode)
  
  const pageBlock = extractPageBlock(jsCode)
  if (!pageBlock) throw new Error('Page 块没找到')

  const wx = {
    getStorageSync: () => '',
    setStorageSync: () => {},
    removeStorageSync: () => {},
    showToast: () => {},
    showModal: async () => ({ confirm: true }),
    navigateTo: () => {},
    navigateBack: () => {},
    request: () => ({ success: () => {}, fail: () => {} }),
  }

  // eval Page 块，捕获 obj
  let captured = null
  const Page = (obj) => { captured = obj }
  const sandbox1 = { Page, wx, console }
  vm.createContext(sandbox1)
  vm.runInContext(`var Page = (obj) => { __captured = obj }\n${pageBlock}`, sandbox1)
  captured = sandbox1.__captured
  if (!captured) throw new Error('Page 块解析失败')

  // 抽 data 默认值
  const dataDefault = captured.data && typeof captured.data === 'function' ? captured.data() : (captured.data || {})
  if (typeof dataDefault !== 'object' || dataDefault === null) throw new Error('data 形状不对')

  // 跑 onShow
  if (typeof captured.onShow !== 'function') {
    // 没 onShow 直接 return data 默认
    return dataDefault
  }
  const sandbox2 = { wx, console, setData: () => {} }
  vm.createContext(sandbox2)
  vm.runInContext(`var data = ${JSON.stringify(dataDefault)}; var setData = (p) => Object.assign(data, p);`, sandbox2)
  vm.runInContext(`(${captured.onShow.toString()})()`, sandbox2)
  return sandbox2.data
}

const results = { steps: [], pass: true }
for (const p of ['matrix', 'list', 'calendar', 'gantt', 'profile']) {
  try {
    const d = await runPage(p)
    if (p === 'matrix') {
      if (!d.quadrants || d.quadrants.length !== 4) throw new Error('matrix 应有 4 象限，实际 ' + (d.quadrants?.length || 0))
      if (d.isDemo !== true) throw new Error('未登录应 isDemo=true，实际 ' + d.isDemo)
    } else if (p === 'list') {
      if (!Array.isArray(d.okrs)) throw new Error('list 应有 okrs 数组')
    } else if (p === 'gantt') {
      if (!Array.isArray(d.rows)) throw new Error('gantt 应有 rows')
    } else if (p === 'calendar') {
      if (!d.monthLabel) throw new Error('calendar 应有 monthLabel')
    } else if (p === 'profile') {
      if (!('isAuthed' in d)) throw new Error('profile 应有 isAuthed')
    }
    results.steps.push({ name: p, pass: true, data: d })
    console.log('  ✓ ' + p + ' (keys: ' + Object.keys(d).slice(0, 5).join(',') + ')')
  } catch (e) {
    results.steps.push({ name: p, pass: false, error: e.message.slice(0, 100) })
    results.pass = false
    console.log('  ✗ ' + p + ': ' + e.message.slice(0, 100))
  }
}

await mkdir(OUT, { recursive: true })
await writeFile(OUT + '/logic-report.json', JSON.stringify(results, null, 2))
const passed = results.steps.filter((s) => s.pass).length
console.log('\n' + passed + '/' + results.steps.length + ' 逻辑 e2e 通过')
