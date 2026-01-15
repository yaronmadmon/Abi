import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';
import { EmotionalContextProvider } from './context/EmotionalContext';
import { UndoProvider } from './context/UndoContext';
import { ViewModeProvider } from './context/ViewModeContext';
import '@/ui/global.css';

function App() {
  return (
    <ViewModeProvider>
      <EmotionalContextProvider>
        <UndoProvider>
          <RouterProvider router={router} />
        </UndoProvider>
      </EmotionalContextProvider>
    </ViewModeProvider>
  );
}

export default App;
