# MP 视觉回归测试用例

## 1. 5 page 渲染
| ID | 描述 | 通过条件 |
|---|---|---|
| TC-MP-01 | matrix 渲染：4 象限 2x2 grid + 8 tasks + sub-tabs | 截图存在 + ≥8 tasks 显示 |
| TC-MP-02 | list 渲染：OKR 树 + 展开/折叠 + KR 行 | 截图 ≥ 200KB（内容多）|
| TC-MP-03 | calendar 渲染：月视图 42 格 + 月份标签 | 截图 ≥ 10KB |
| TC-MP-04 | gantt 渲染：3 月标签 + summary cards + bar | 截图 ≥ 10KB |
| TC-MP-05 | profile 渲染：资料 + 3 统计 + 偏好 + 账号 | 截图 ≥ 10KB |

## 2. 设计 1:1 还原 (像素 diff)
| ID | 描述 | 通过条件 |
|---|---|---|
| TC-MP-06 | matrix 4 象限 top 蓝/绿/橙/灰边框 | DOM check 颜色 |
| TC-MP-07 | 选中 tab 蓝色下划线 | DOM check border-color |
| TC-MP-08 | OKR pill 20x20 圆 (P/H/S/$) | DOM check class |
| TC-MP-09 | task 完成划线 | DOM check .done class |
| TC-MP-10 | profile 退出登录按钮 (authed) | DOM check element |
