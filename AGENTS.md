# Antigravity 專案代理指令 (AGENTS.md) - Mermaid UML Studio

本文件定義了在這個專案中的開發規範、架構原則與營運規則。作為開發助手，在處理任何任務時，請遵循本專案特定的指示。

## 核心哲學與目標

1. **架構優先 (Architecture First)**
   - 專注於可擴展性、乾淨架構和以使用者為中心的設計模式。
2. **實用與強健 (Practicality & Robustness)**
   - 優先選擇穩定、強健且經過驗證的解決方案，而非實驗性質或過度複雜的實作。
3. **無障礙性 (Accessibility)**
   - 確保所有 UI 元件符合 WCAG 2.1 AA 標準，包含正確的 ARIA 屬性與鍵盤導航支援。
4. **效能優化 (Performance)**
   - 減少不必要的重新渲染，合理使用 `React.memo`、`useCallback` 與 `useMemo` 優化效能。

## 專案技術棧 (Tech Stack)

- **核心框架**: Next.js 16+ (App Router) 與 React 19
- **程式語言**: TypeScript 5.8+ (嚴格型別安全)
- **樣式系統**: Tailwind CSS v4
- **圖表渲染**: Mermaid.js 11+
- **Markdown 解析**: Marked.js 11+
- **圖標庫**: Lucide React
- **程式碼品質**: Prettier (搭配 Tailwind 插件), ESLint (Next.js 配置)

## 開發營運規則 (Critical Rules)

1. **語言規範**
   - 必須使用 **繁體中文 (Traditional Chinese)** 進行回應與溝通。
2. **程式碼標準**
   - **DRY & Modular**: 重複的邏輯應封裝至 hooks、components 或 utils 中。
   - **型別安全**: 執行嚴格的 TypeScript 型別定義，避免使用 `any`。
   - **錯誤處理**: 統一使用 [lib/utils.ts](file:///Users/eden/Code/mermaid-uml-studio/lib/utils.ts) 中的 `handleError` 和 `ErrorType` 進行錯誤管理。
   - **主題一致性**: 任何 UI 樣式或主題調整必須參考並遵循 [lib/theme.config.ts](file:///Users/eden/Code/mermaid-uml-studio/lib/theme.config.ts) 中的設計系統配置。
3. **架構確認**
   - 在建立新元件或修改核心架構前，必須先與 Eden 確認專案的目錄結構和設計意圖。
4. **Markdown 格式輸出**
   - 回應中輸出的 Markdown 必須乾淨專業，**不得包含任何圖標或 emoji** (除非使用者明確要求)。
5. **不主動生成文件**
   - 除非使用者明確要求，否則不要在 workspace 中主動生成新的 `.md` 文件或冗長的研究記錄。
6. **代碼格式化**
   - 在新增或編輯程式碼後，請確保符合專案的 Prettier 格式規範及 Tailwind 排版規則。

## 專案目錄結構參考

- [app/](file:///Users/eden/Code/mermaid-uml-studio/app): Next.js 頁面與全域樣式。
  - [app/globals.css](file:///Users/eden/Code/mermaid-uml-studio/app/globals.css): 全域樣式定義。
- [components/](file:///Users/eden/Code/mermaid-uml-studio/components): 專案內所有共享的 React 元件（例如 `CodeEditor.tsx`, `MarkdownPreview.tsx` 等）。
- [lib/](file:///Users/eden/Code/mermaid-uml-studio/lib): 核心工具與設定。
  - [lib/constants.ts](file:///Users/eden/Code/mermaid-uml-studio/lib/constants.ts): 靜態常數定義。
  - [lib/theme.config.ts](file:///Users/eden/Code/mermaid-uml-studio/lib/theme.config.ts): 設計系統主題。
  - [lib/utils.ts](file:///Users/eden/Code/mermaid-uml-studio/lib/utils.ts): 工具函數與錯誤處理。
- [types/](file:///Users/eden/Code/mermaid-uml-studio/types): 靜態型別定義。
