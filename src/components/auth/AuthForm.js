'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; //для редиректа
import { adminService } from '@/api/adminService';//сервис для входа(регистрация и логинирование)
import { authService } from '@/api/authService';//сервис для получения JWT токена
import { AdminRequest } from '@/models/admin';//класс для запроса регистрации
import { AdminLoginRequest } from '@/models/admin';//класс для логина
import styles from './AuthForm.module.css';

export default function AuthForm() {
  const router = useRouter(); //ХУК ДЛЯ НАВИГАЦИИ!!!

  //переключение между логином и регистрацией
  const [isLogin, setIsLogin] = useState(true);
   //состояние для данных формы
  const [formData, setFormData] = useState({
    name: '',//только для регистрации
    login: '',//для обоих
    password: ''//для обоих
  });
  //загрузка
  const [loading, setLoading] = useState(false);
  //если усспешно
  const [message, setMessage] = useState('');
  //ошибки
  const [error, setError] = useState('');
//отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();//отменяем стандартную отправку формы
    setLoading(true);//включаем загрузку
    setError('');//очищаем ошибки
    setMessage('');//сообщения

    try {
      if (isLogin) {
        //ЛОГИН
        const loginData = new AdminLoginRequest();
        loginData.login = formData.login;
        loginData.password = formData.password;
        //получаем данные админа из бд после входа с apiKey
        const apiKey = await adminService.login(loginData);
        console.log("apikey: " + apiKey);
        //получаем токен по ключу
        const token = await authService.getTokenByApiKey(apiKey);
        console.log("token: " + token);
        //получаем данные админа
        const adminResponse = await adminService.getAdmin(apiKey);
        setMessage(`Успешный вход! Добро пожаловать, ${adminResponse.name}`);

        //РЕДИРЕКТ НА ГЛАВНУЮ ЧЕРЕЗ 1.5 СЕКУНДЫ
        setTimeout(() => {
          router.push('/'); // переход на главную страницу
        }, 1500);
        
      } else {
        // РЕГИСТРАЦИЯ
        const adminData = new AdminRequest();
        adminData.name = formData.name;
        adminData.login = formData.login;
        adminData.password = formData.password;
        //роль по умолчанию "reader" установится на бэкенде автоматически для всех новых
         
        //получаем админа после регитрации с apiKey
        const apiKey = await adminService.register(adminData);
         //получаем токен по ключу
        const token = await authService.getTokenByApiKey(apiKey);
        const response = await adminService.getAdmin(apiKey);
        setMessage(`Админ ${response.name} успешно зарегистрирован!`);
        setFormData({ name: '', login: '', password: '' });//очищаем
        // РЕДИРЕКТ НА ГЛАВНУЮ ЧЕРЕЗ 1.5 СЕКУНДЫ
        setTimeout(() => {
          router.push('/'); // переход на главную страницу
        }, 1500);
      }
      
    } catch (err) {
      setError(err.message || `Ошибка при ${isLogin ? 'входе' : 'регистрации'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    //обновляем состояние formData при вводе в любое поле
    setFormData({
      ...formData, //копируем предыдущие значения
      [e.target.name]: e.target.value //обновляем только измененное поле
    });
  };
//переключаем режим
  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');//очищение
    setMessage('');
    setFormData({
      name: '',//очищение
      login: '',//
      password: ''//
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
       {/* Заголовок меняется в зависимости от режима */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isLogin ? 'Вход в систему' : 'Регистрация администратора'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Войдите в свою учетную запись' 
              : 'Создайте новую учетную запись'
            }
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Имя (только для регистрации) */}
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Полное имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={!isLogin}
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Введите полное имя"
              />
            </div>
          )}

          {/* Логин */}
          <div className={styles.inputGroup}>
            <label htmlFor="login" className={styles.label}>
              Логин
            </label>
            <input
              id="login"
              name="login"
              type="text"
              required
              value={formData.login}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите логин"
            />
          </div>

          {/* Пароль */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Введите пароль"
            />
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
          >
            {loading ? (
              <div className={styles.buttonContent}>
                <div className={styles.spinner}></div>
                {isLogin ? 'Вход...' : 'Регистрация...'}
              </div>
            ) : (
              isLogin ? 'Войти' : 'Зарегистрировать'
            )}
          </button>
        </form>

        {/* Переключатель */}
        <div className={styles.switch}>
          <span>
            {isLogin ? 'Нет учетной записи?' : 'Уже есть учетная запись?'}
          </span>
          <button 
            type="button" 
            onClick={switchMode}
            className={styles.switchButton}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>

        {/* Сообщения об ошибках/успехе */}
        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            <span>❌</span>
            <div>
              <strong>Ошибка:</strong> {error}
            </div>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${styles.success}`}>
            <span>✅</span>
            <div>
              <strong>Успех!</strong> {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}