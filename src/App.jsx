import { NumberGame } from './pages/NumberGame';
import './styles/index.css'; // Đảm bảo file tồn tại

function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', width: '100%'  }}>
      <NumberGame />
    </div>
  );
}

export default App;