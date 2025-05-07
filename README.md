# holidays-kr

- No need for a separate API key—just fetch data effortlessly with a single call.
- All data is sourced directly from the Korea Astronomical Research Institute's official holiday database via the Public Data Portal.
- Holiday data is available from 2004 onward, with regular updates three times a month to keep it current.
- You can retrieve holiday information for the upcoming year annually, but data for the year after next is not included.
- Supports both `commonjs` and `ESM`.

## Install
```
npm i @kyungseopk1m/holidays-kr
```


## Usage

```typescript
import { holidays } from '@kyungseopk1m/holidays-kr';

const result = await holidays('2025');

console.log(result);    // Data from 2025.01 to 2025.12

// or

const { holidays } = require('@kyungseopk1m/holidays-kr');

const data = await holidays('2010', '2015');

console.log(data);    // Data from 2010.01 to 2015.12
```

## Output

| Property | Description                    |
|----------|--------------------------------|
| success  | API call success status        |
| message  | Response message               |
| name     | Holiday name (in Korean)       |
| date     | Date in 'YYYYMMDD' format      |

<br>

```typescript
interface response {
    success: boolean;
    message: string;
    data: example[];
}

interface example {
    date: number;
    name: string;
}
```

## License

[MIT](LICENSE)
