import WogMetrics from './_components/WogMetrics'
import WogSalesChart from './_components/WogSalesChart'
import WogMonthlyTarget from './_components/WogMonthlyTarget'
import WogRecentOrders from './_components/WogRecentOrders'
import WogCRM from './_components/WogCRM'
import WogProducts from './_components/WogProducts'
import WogTasks from './_components/WogTasks'
import WogPostIt from './_components/WogPostIt'

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      {/* KPIs */}
      <div className="col-span-12">
        <WogMetrics />
      </div>

      {/* Graphique ventes + Objectif mensuel */}
      <div className="col-span-12 xl:col-span-8">
        <WogSalesChart />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <WogMonthlyTarget />
      </div>

      {/* Commandes récentes + CRM */}
      <div className="col-span-12 xl:col-span-7">
        <WogRecentOrders />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <WogCRM />
      </div>

      {/* Tâches + Post-it */}
      <div className="col-span-12 xl:col-span-6">
        <WogTasks />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <WogPostIt />
      </div>

      {/* Gestion produits */}
      <div className="col-span-12">
        <WogProducts />
      </div>

    </div>
  )
}
