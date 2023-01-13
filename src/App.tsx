import './App.css';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { HomePage } from './pages/home/HomePage';

export const App = () => {
  return (
    <Provider store={store}>
      <HomePage />
    </Provider>
  );
}
