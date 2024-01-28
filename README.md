# holidays-kr

- 공공데이터포털 내 한국천문연구원의 공휴일 정보를 기반으로 데이터를 제공합니다.
- 2004년부터의 공휴일 정보를 제공하며, 매월 3회에 걸쳐 주기적으로 최신 데이터를 불러옵니다.
- 11월부터 당해년도가 아닌 다음해의 공휴일 정보를 불러올 수 있습니다.
- `commonjs`와 `ESM`을 지원합니다.

## Install
```
npm i @kyungseopk1m/holidays-kr
```


## Usage

```typescript
import { holidays } from '@kyungseopk1m/holidays-kr';

const result = await holidays('2024');

console.log(result);    // 2024.01 ~ 2024.12 데이터

// or

const { holidays } = require('@kyungseopk1m/holidays-kr');

const data = await holidays('2010', '2015');

console.log(data);    // 2010.01 ~ 2015.12 데이터
```

## Output

| 속성      | 설명 |
|---------|-----|
| name    | 공휴일의 이름 |
| date    | 'YYYYMMDD' 형식의 날짜 |

```typescript
interface example {
    "date": 20240101,
    "name": "1월1일"
}
```

## License

[MIT](LICENSE)
