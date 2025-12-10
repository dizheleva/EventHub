# EventHub - Каталог за събития

EventHub е Single Page Application (SPA), изградена с React.js, която предоставя каталог за събития. Приложението позволява на потребителите да разглеждат, създават, редактират и изтриват събития, както и да коментират и взаимодействат с тях.

## Технологии

### Frontend
- **React.js 19** - Frontend framework
- **React Router 7** - Клиентска маршрутизация
- **React Toastify** - Известия и toast съобщения
- **Vite** - Build tool и development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Икони
- **Vitest** - Unit тестване
- **React Testing Library** - Тестване на React компоненти

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **JSON** - File-based database (db.json)

## Структура на проекта

```
NewEventhub/
├── client/                    # Frontend приложение
│   ├── public/
│   │   ├── favicon.svg        # Favicon
│   │   └── styles/            # CSS стилове
│   ├── src/
│   │   ├── components/        # React компоненти
│   │   │   ├── catalog/       # Каталог страница
│   │   │   ├── details/       # Детайли за събитие
│   │   │   │   ├── create-comment/    # Форма за коментар
│   │   │   │   ├── details-comments/  # Списък с коментари
│   │   │   │   └── DeleteEventModal.jsx
│   │   │   ├── event-card/    # Карта за събитие
│   │   │   │   ├── EventCard.jsx
│   │   │   │   └── EventCardSkeleton.jsx
│   │   │   ├── events/        # Събития компоненти
│   │   │   │   ├── AddEventButton.jsx
│   │   │   │   ├── CreateEventModal.jsx
│   │   │   │   ├── EditEventModal.jsx
│   │   │   │   ├── EventCreateForm.jsx
│   │   │   │   ├── EditEventForm.jsx
│   │   │   │   └── Filters/   # Филтри за събития
│   │   │   ├── common/        # Общи компоненти
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── navigation/ # Навигация компоненти
│   │   │   ├── header/        # Header компонент
│   │   │   ├── footer/        # Footer компонент
│   │   │   ├── home/          # Начална страница
│   │   │   │   └── Features.jsx
│   │   │   ├── login/         # Вход
│   │   │   ├── register/      # Регистрация
│   │   │   ├── logout/        # Изход
│   │   │   ├── my-events/     # Мои събития
│   │   │   ├── profile/       # Профил
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── ProfileHeader.jsx
│   │   │   │   ├── EditProfileForm.jsx
│   │   │   │   └── EditProfileModal.jsx
│   │   │   └── route-guard/   # Route guard компонент
│   │   ├── contexts/          # React Context API
│   │   │   └── UserContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useRequest.js
│   │   │   ├── useForm.js
│   │   │   ├── usePersistedState.js
│   │   │   ├── useEventFilters.js
│   │   │   └── useToast.js
│   │   ├── utils/             # Utility функции
│   │   │   ├── categories.js
│   │   │   ├── dateHelpers.js
│   │   │   ├── eventHelpers.js
│   │   │   └── filterEvents.js
│   │   ├── test/              # Тестова конфигурация
│   │   │   └── setup.js
│   │   ├── App.jsx            # Главен компонент
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Главни стилове
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
├── server/                     # Backend сървър
│   ├── server.js              # Express сървър
│   ├── db.json                # База данни (JSON)
│   ├── package.json
│   └── README.md
└── README.md                   # Главна документация
```

## Функционалности

### Публична част (без аутентификация)
- Разглеждане на каталог събития с филтри, търсене и сортиране
- Пагинация на резултатите
- Преглед на детайли за събитие
- Преглед на коментари
- Преглед на профили на потребители

### Частна част (с аутентификация)
- Създаване на нови събития (чрез модал)
- Редактиране на собствени събития (чрез модал)
- Изтриване на собствени събития (с потвърждение)
- Добавяне на коментари към събития
- Преглед на собствени събития (Мои Събития)
- Редактиране на профил (чрез модал)
- Изход от профила

### Аутентификация
- Регистрация на нов потребител (с опционално име и аватар)
- Вход в системата
- Изход от системата
- Route guards за защита на частни страници
- Автоматично запазване на сесията (localStorage)

### Допълнителни функции
- Търсене на събития по заглавие
- Филтриране по град, категория, цена и дата
- Сортиране по заглавие, дата или локация
- Пагинация с избиране на брой елементи на страница
- Loading states (спинъри и skeleton loaders)
- Error Boundary за обработка на грешки
- Toast известия за всички операции
- Responsive дизайн

## Инсталация и стартиране

### Предварителни изисквания
- Node.js (версия 18 или по-нова)
- npm или yarn

### Инсталация

**1. Клонирай репозитория:**
```bash
git clone <repository-url>
cd NewEventhub
```

**2. Инсталирай backend зависимости:**
```bash
cd server
npm install
```

**3. Инсталирай frontend зависимости:**
```bash
cd ../client
npm install
```

**4. Създай .env файл в client директорията:**
```bash
# client/.env
VITE_APP_SERVER_URL=http://localhost:3030
```

### Стартиране

**1. Стартирай backend сървъра (в нов терминал):**
```bash
cd server
npm start
```
Сървърът ще стартира на `http://localhost:3030`

**2. Стартирай frontend приложението (в друг терминал):**
```bash
cd client
npm run dev
```
Приложението ще стартира на `http://localhost:5173`

**3. Отвори браузъра:**
```
http://localhost:5173
```

### Тестови потребители

След инсталацията можеш да използваш следните тестови акаунти:

- **Email:** `ivan@example.com`, **Password:** `123456`
- **Email:** `maria@example.com`, **Password:** `123456`

## Тестване

Приложението включва unit тестове, написани с Vitest и React Testing Library.

**Стартиране на тестовете:**
```bash
cd client
npm test
```

**Стартиране на тестовете с UI:**
```bash
npm run test:ui
```

**Стартиране на тестовете с coverage:**
```bash
npm run test:coverage
```

## API Endpoints

Приложението комуникира с REST API на следните endpoints:

### Аутентификация
- `POST /users/register` - Регистрация на нов потребител
- `POST /users/login` - Вход в системата
- `GET /users/logout` - Изход от системата
- `GET /users/:id` - Получаване на потребител по ID
- `PUT /users/:id` - Обновяване на потребителски профил

### Събития
- `GET /data/events` - Всички събития
- `GET /data/events/:id` - Детайли за събитие
- `POST /data/events` - Създаване на събитие
- `PUT /data/events/:id` - Редактиране на събитие
- `DELETE /data/events/:id` - Изтриване на събитие

### Коментари
- `GET /data/comments` - Всички коментари
- `POST /data/comments` - Създаване на коментар

### Потребители
- `GET /data/users` - Всички потребители

## React концепции

Приложението демонстрира използването на:

- **React Hooks**: 
  - `useState` - Управление на локално състояние
  - `useEffect` - Side effects и lifecycle
  - `useContext` - Доступ до Context API
  - `useParams` - Параметри от URL
  - `useNavigate` - Навигация
  - `useMemo` - Мемоизация на изчисления
  - `useCallback` - Мемоизация на функции

- **Context API**: UserContext за управление на потребителската сесия

- **Stateless и Stateful компоненти**: Комбинация от двата типа

- **Bound forms**: Използване на custom `useForm` hook за управление на форми

- **Synthetic events**: Обработка на събития в React

- **Component lifecycle**: mount, update, unmount чрез `useEffect`

- **Route Guards**: Защита на маршрути за автентифицирани и неавтентифицирани потребители

- **Error Boundary**: Обработка на грешки на ниво приложение

## Структура на данните

### Event
```javascript
{
  _id: string,
  title: string,
  category: string,           // "Деца", "Култура", "Спорт", "Работилници", "Сезонни", "Благотворителни"
  date: string,                // ISO date string
  location: string,             // "Град, Адрес" или "Онлайн"
  imageUrl: string,            // URL на изображение
  websiteUrl: string,          // URL на официална страница
  description: string,
  price: number,               // 0 = безплатно
  tags: string,                // Разделени със запетая
  _ownerId: string,            // ID на създателя
  _createdOn: number           // Timestamp
}
```

### Comment
```javascript
{
  _id: string,
  comment: string,
  eventId: string,
  _ownerId: string,
  _createdOn: number,
  author: User                  // Зарежда се отделно
}
```

### User
```javascript
{
  _id: string,
  email: string,
  username: string,            // Опционално
  avatarUrl: string,           // Опционално
  accessToken: string,         // За автентифицирани потребители
  _createdOn: number
}
```

## Скриптове

### Frontend (client/)
- `npm run dev` - Стартира development сървър
- `npm run build` - Build за production
- `npm run preview` - Preview на production build
- `npm run lint` - Проверка на код с ESLint
- `npm test` - Стартиране на тестове
- `npm run test:ui` - Стартиране на тестове с UI
- `npm run test:coverage` - Стартиране на тестове с coverage

### Backend (server/)
- `npm start` - Стартира сървъра

## Технически детайли

### Стилизиране
- Приложението използва **Tailwind CSS** за стилизиране
- Custom цветова палитра и анимации
- Responsive дизайн за мобилни устройства
- Gradient ефекти и модерен UI

### State Management
- **Context API** за глобално състояние (потребител)
- **localStorage** за персистентност на сесията
- **Custom hooks** за управление на форми и заявки

### Error Handling
- Error Boundary на ниво приложение
- Toast известия за всички операции
- Валидация на форми
- Обработка на API грешки

## Автор

Създадено като проект за SoftUni React курс.

## Лиценз

Този проект е създаден за образователни цели.
