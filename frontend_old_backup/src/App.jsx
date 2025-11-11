import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import Header from './components/Layout/Header';
import Container from './components/Layout/Container';
import Transactions from './pages/Transactions';
import Portfolio from './pages/Portfolio';
import CapitalGains from './pages/CapitalGains';

function App() {
  return (
    <PortfolioProvider>
      <Router>
        <Container>
          <Header />
          <Routes>
            <Route path="/" element={<Transactions />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/capital-gains" element={<CapitalGains />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Router>
    </PortfolioProvider>
  );
}

export default App;

