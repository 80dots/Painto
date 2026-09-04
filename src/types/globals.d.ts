/** Metro 가 처리하는 에셋 모듈 타입 선언 */
declare module '*.css';

declare module '*.sql' {
  const content: string;
  export default content;
}
