import { observer } from 'mobx-react-lite';
import { IconButton } from './components/IconButton';
import { TodoTree } from './components/TodoTree';
import { PlusIcon } from './components/icons';
import { useTodoStore } from './store/TodoStoreContext';

const App = observer(() => {
  const store = useTodoStore();

  const handleAddRoot = () => {
    store.addItem(null);
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-xl shadow-slate-200/60">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Список задач</h1>
            <p className="mt-1 text-sm text-slate-500">
              Перетаскивайте задачи, чтобы менять порядок и уровни вложенности.
            </p>
          </div>
          <IconButton
            icon={<PlusIcon size={18} />}
            label="Добавить задачу"
            variant="primary"
            className="h-10 w-10"
            onClick={handleAddRoot}
          />
        </header>

        <div className="space-y-6">
          {store.items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center">
              <p className="text-base font-medium text-slate-600">Добавьте первую задачу</p>
              <p className="mt-2 text-sm text-slate-400">
                Нажмите на кнопку «плюс» или перенесите сюда пункт из другого уровня.
              </p>
            </div>
          )}

          <TodoTree parentId={null} items={store.items} depth={0} />
        </div>
      </div>
    </div>
  );
});

export default App;
