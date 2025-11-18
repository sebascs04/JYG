import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter basename="/JYG">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
