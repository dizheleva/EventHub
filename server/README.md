# EventHub Server

Прост REST API сървър за EventHub приложението.

## Инсталация

```bash
cd server
npm install
```

## Стартиране

```bash
npm start
```

Сървърът ще стартира на `http://localhost:3030`

## API Endpoints

### Authentication

- `POST /users/register` - Регистрация на нов потребител
- `POST /users/login` - Вход в системата
- `GET /users/logout` - Изход от системата

### Events

- `GET /data/events` - Всички събития
- `GET /data/events/:id` - Детайли за събитие
- `POST /data/events` - Създаване на събитие (изисква authentication)
- `PUT /data/events/:id` - Редактиране на събитие (изисква authentication, само собственик)
- `DELETE /data/events/:id` - Изтриване на събитие (изисква authentication, само собственик)

### Comments

- `GET /data/comments?where=eventId="..."` - Коментари за събитие
- `POST /data/comments` - Създаване на коментар (изисква authentication)

## Данни

Данните се съхраняват в `db.json` файл. При стартиране на сървъра се зареждат примерни данни за събития, коментари и потребители.

## Тестови потребители

- Email: `ivan@example.com`, Password: `123456`
- Email: `maria@example.com`, Password: `123456`

*Забележка: В production среда трябва да използвате по-сигурна хешираща функция за паролите.*

