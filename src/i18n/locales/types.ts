import type { ko } from './ko';

/** 한국어 카탈로그의 구조를 다른 언어에도 그대로 강제한다 (키 누락 시 타입 오류) */
export type Translation = {
  [Section in keyof typeof ko]: {
    [Key in keyof (typeof ko)[Section]]: (typeof ko)[Section][Key] extends readonly string[]
      ? readonly string[]
      : string;
  };
};
