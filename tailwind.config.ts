import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    screens: {
      xs: "475px", // 추가: 아주 작은 모바일
      sm: "640px", // 기본: 작은 태블릿
      md: "768px", // 기본: 태블릿
      lg: "1024px", // 기본: 작은 데스크톱
      xl: "1280px", // 기본: 데스크톱
      "2xl": "1536px", // 기본: 큰 데스크톱
    },
  },
};

export default config;
