"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { dietPlans, DietPlan, Meal, MealCreate, MealItemCreate } from "@/lib/api";
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const MEAL_TYPES = [
  { value: "breakfast", label: "Kahvalti" },
  { value: "lunch", label: "Ogle Yemegi" },
  { value: "dinner", label: "Aksam Yemegi" },
  { value: "snack", label: "Ara Ogun" },
];

const DAYS = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];

export default function DietPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealForm, setMealForm] = useState<MealCreate>({
    meal_type: "breakfast",
    day_of_week: 1,
    name: "",
    description: "",
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
  });

  // Meal item state
  const [addingItemToMeal, setAddingItemToMeal] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<MealItemCreate>({
    name: "",
    amount: "",
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
  });
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const loadPlan = async () => {
    try {
      const data = await dietPlans.get(params.id as string);
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [params.id]);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dietPlans.addMeal(params.id as string, mealForm);
      setShowAddMeal(false);
      setMealForm({ meal_type: "breakfast", day_of_week: 1, name: "", description: "" });
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Bu ogunu silmek istediginize emin misiniz?")) return;
    try {
      await dietPlans.deleteMeal(params.id as string, mealId);
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent, mealId: string) => {
    e.preventDefault();
    try {
      await dietPlans.addMealItem(params.id as string, mealId, itemForm);
      setAddingItemToMeal(null);
      setItemForm({ name: "", amount: "", calories: undefined, protein: undefined, carbs: undefined, fat: undefined });
      setExpandedMeals((prev) => new Set(prev).add(mealId));
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (mealId: string, itemId: string) => {
    try {
      await dietPlans.deleteMealItem(params.id as string, mealId, itemId);
      loadPlan();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMealExpand = (mealId: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);
      return next;
    });
  };

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const mealsByDay = DAYS.map((day, index) => ({
    day,
    dayNum: index + 1,
    meals: plan.meals.filter((m) => m.day_of_week === index + 1),
  }));

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={20} />
        Geri
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          {plan.description && <p className="text-gray-500 mt-1">{plan.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{plan.start_date} - {plan.end_date}</p>
        </div>
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Ogun Ekle
        </button>
      </div>

      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Yeni Ogun</h2>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ogun Tipi</label>
                  <select
                    value={mealForm.meal_type}
                    onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gun</label>
                  <select
                    value={mealForm.day_of_week}
                    onChange={(e) => setMealForm({ ...mealForm, day_of_week: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    {DAYS.map((d, i) => (
                      <option key={i} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ogun Adi</label>
                <input
                  type="text"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aciklama</label>
                <textarea
                  value={mealForm.description || ""}
                  onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Ekle</button>
                <button type="button" onClick={() => setShowAddMeal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Iptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addingItemToMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Besin Ogesi Ekle</h2>
            <form onSubmit={(e) => handleAddItem(e, addingItemToMeal)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Besin Adi</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="orn: Tam bugday ekmek"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
                <input
                  type="text"
                  value={itemForm.amount || ""}
                  onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                  placeholder="orn: 2 dilim, 1 bardak, 150g"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kalori</label>
                  <input
                    type="number"
                    value={itemForm.calories ?? ""}
                    onChange={(e) => setItemForm({ ...itemForm, calories: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={itemForm.protein ?? ""}
                    onChange={(e) => setItemForm({ ...itemForm, protein: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Karbonhidrat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={itemForm.carbs ?? ""}
                    onChange={(e) => setItemForm({ ...itemForm, carbs: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yag (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={itemForm.fat ?? ""}
                    onChange={(e) => setItemForm({ ...itemForm, fat: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Ekle</button>
                <button type="button" onClick={() => setAddingItemToMeal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Iptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {mealsByDay.map(({ day, meals }) => (
          <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{day}</h3>
            </div>
            <div className="p-4">
              {meals.length === 0 ? (
                <p className="text-sm text-gray-400">Bu gun icin ogun tanimlanmamis</p>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal) => {
                    const isExpanded = expandedMeals.has(meal.id);
                    const items = meal.items || [];
                    const totalCal = items.reduce((s, i) => s + (i.calories || 0), 0);
                    const totalP = items.reduce((s, i) => s + (i.protein || 0), 0);
                    const totalC = items.reduce((s, i) => s + (i.carbs || 0), 0);
                    const totalF = items.reduce((s, i) => s + (i.fat || 0), 0);

                    return (
                      <div key={meal.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {MEAL_TYPES.find((t) => t.value === meal.meal_type)?.label}
                              </span>
                              <span className="font-medium text-sm">{meal.name}</span>
                              {items.length > 0 && (
                                <span className="text-xs text-gray-400">({items.length} besin)</span>
                              )}
                            </div>
                            {meal.description && <p className="text-xs text-gray-500">{meal.description}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            {items.length > 0 && (
                              <button
                                onClick={() => toggleMealExpand(meal.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setAddingItemToMeal(meal.id);
                                setItemForm({ name: "", amount: "", calories: undefined, protein: undefined, carbs: undefined, fat: undefined });
                              }}
                              className="p-1 text-green-500 hover:text-green-700"
                              title="Besin Ekle"
                            >
                              <Plus size={16} />
                            </button>
                            <button onClick={() => handleDeleteMeal(meal.id)} className="p-1 text-red-500 hover:text-red-700">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded items list */}
                        {isExpanded && items.length > 0 && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <div className="space-y-2">
                              {items
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between py-1.5 px-2 bg-white rounded-md"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                        {item.amount && (
                                          <span className="text-xs text-gray-400">({item.amount})</span>
                                        )}
                                      </div>
                                      <div className="flex gap-3 ml-3.5 mt-0.5 text-xs text-gray-400">
                                        {item.calories != null && <span>{item.calories} kcal</span>}
                                        {item.protein != null && <span>P: {item.protein}g</span>}
                                        {item.carbs != null && <span>K: {item.carbs}g</span>}
                                        {item.fat != null && <span>Y: {item.fat}g</span>}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteItem(meal.id, item.id)}
                                      className="text-red-400 hover:text-red-600 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                            {/* Totals */}
                            {(totalCal > 0 || totalP > 0 || totalC > 0 || totalF > 0) && (
                              <div className="mt-2 pt-2 border-t border-gray-200 flex gap-4 text-xs font-medium text-gray-600">
                                <span>Toplam:</span>
                                {totalCal > 0 && <span>{totalCal} kcal</span>}
                                {totalP > 0 && <span>P: {totalP.toFixed(1)}g</span>}
                                {totalC > 0 && <span>K: {totalC.toFixed(1)}g</span>}
                                {totalF > 0 && <span>Y: {totalF.toFixed(1)}g</span>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show totals even when collapsed if items exist */}
                        {!isExpanded && items.length > 0 && totalCal > 0 && (
                          <div className="mt-1 flex gap-3 text-xs text-gray-400">
                            <span>{totalCal} kcal</span>
                            {totalP > 0 && <span>P: {totalP.toFixed(1)}g</span>}
                            {totalC > 0 && <span>K: {totalC.toFixed(1)}g</span>}
                            {totalF > 0 && <span>Y: {totalF.toFixed(1)}g</span>}
                          </div>
                        )}

                        {/* Show meal-level macros if no items */}
                        {items.length === 0 && (
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            {meal.calories && <span>{meal.calories} kcal</span>}
                            {meal.protein && <span>P: {meal.protein}g</span>}
                            {meal.carbs && <span>K: {meal.carbs}g</span>}
                            {meal.fat && <span>Y: {meal.fat}g</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
