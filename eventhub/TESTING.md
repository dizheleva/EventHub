# Тестване на EventHub

## Инсталация

Тестовите зависимости са вече инсталирани. Ако трябва да ги инсталирате отново:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

## Изпълняване на тестове

### Всички тестове
```bash
npm test
```

### Еднократно изпълнение
```bash
npm test -- --run
```

### С UI интерфейс
```bash
npm run test:ui
```

### Watch mode (автоматично при промени)
```bash
npm test
```

## Структура на тестовете

Тестовете са организирани в директории `__tests__` до съответните файлове:

```
src/
├── api/
│   └── __tests__/
│       └── favoritesApi.test.js
├── components/
│   ├── common/
│   │   └── __tests__/
│   │       ├── LoadingSpinner.test.jsx
│   │       └── EmptyState.test.jsx
│   └── profile/
│       └── __tests__/
│           └── LikeButton.test.jsx
├── hooks/
│   └── __tests__/
│       └── useFavorites.test.js
├── lib/
│   └── __tests__/
│       └── utils.test.js
└── utils/
    └── __tests__/
        ├── dateFormatter.test.js
        ├── priceFormatter.test.js
        ├── userHelpers.test.js
        └── validators.test.js
```

## Покритие на тестове

### Utility функции (90 теста)
- ✅ `userHelpers.js` - 15 теста
- ✅ `validators.js` - 29 теста
- ✅ `dateFormatter.js` - 10 теста
- ✅ `priceFormatter.js` - 8 теста
- ✅ `utils.js` (cn function) - 5 теста

### API функции
- ✅ `favoritesApi.js` - 8 теста

### React компоненти
- ✅ `LoadingSpinner` - 3 теста
- ✅ `EmptyState` - 3 теста
- ✅ `LikeButton` - 5 теста

### Custom hooks
- ✅ `useFavorites` - 4 теста

## Написане на нови тестове

### Пример за utility функция

```javascript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../myFunction'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected output')
  })
})
```

### Пример за React компонент

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Пример за custom hook

```javascript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

// Mock dependencies
vi.mock('@/api/myApi')

describe('useMyHook', () => {
  it('should load data on mount', async () => {
    const { result } = renderHook(() => useMyHook())
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })
})
```

## Best Practices

1. **Използвайте описателни имена на тестове** - описват какво тестват
2. **Тествайте едно нещо на тест** - всеки тест трябва да проверява една функционалност
3. **Използвайте AAA pattern** - Arrange, Act, Assert
4. **Mock-вайте външни зависимости** - API заявки, context-и, и т.н.
5. **Тествайте edge cases** - празни стойности, null, undefined, гранични стойности
6. **Използвайте `waitFor` за async операции** - вместо `setTimeout`

## Конфигурация

Тестовата конфигурация се намира в `vite.config.js`:

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  css: true,
}
```

Setup файлът (`src/test/setup.js`) конфигурира:
- `@testing-library/jest-dom` matchers
- Автоматично cleanup след всеки тест
- Mock за `window.matchMedia`

## Полезни ресурси

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)

