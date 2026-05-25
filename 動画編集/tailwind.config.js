/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // クラス制御によるダークモード対応
  theme: {
    extend: {
      colors: {
        // 動画編集UIに適した暗めのカラーパレット
        editor: {
          bg: '#121214',       // 全体の背景色
          panel: '#1e1e24',    // ペインの背景色
          border: '#2a2a32',   // パネルの境界線
          stripe: '#252529',   // タイムラインなどの互い違いの背景
          accent: '#6366f1',   // インディゴ（選択中やボタンなどのアクセント）
          accentHover: '#4f46e5'
        }
      }
    },
  },
  plugins: [],
}