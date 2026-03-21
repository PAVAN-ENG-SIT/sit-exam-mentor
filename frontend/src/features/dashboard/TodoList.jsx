import { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../store/authStore';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setTodos(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTask.trim(), user_id: user.id, is_completed: false }])
      .select();
    if (!error && data) {
      setTodos((prev) => [data[0], ...prev]);
      setNewTask('');
    }
  };

  const handleToggle = async (id, is_completed) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id);
    if (!error) {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !is_completed } : t)));
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-40">
      <div className="max-w-3xl mx-auto mt-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">To-Do List</h2>
        
        {/* Add Task */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="shrink-0 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 text-white rounded-xl px-4 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-1">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="group flex justify-between items-center py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent dark:hover:border-white/5"
            >
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggle(todo.id, todo.is_completed)} className="text-gray-400 hover:text-violet-500 transition-colors">
                  {todo.is_completed ? <CheckCircle className="w-5 h-5 text-violet-500" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-sm ${todo.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {todos.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500 dark:text-gray-400">All caught up! Add a new task above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
