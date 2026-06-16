import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import { getStatusVariant, tasks } from '../mock/agencyData'

function Tasks() {
  const columns = [
    { key: 'title', label: 'งาน' },
    { key: 'owner', label: 'ผู้รับผิดชอบ' },
    { key: 'due', label: 'กำหนดส่ง' },
    {
      key: 'status',
      label: 'สถานะ',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
  ]

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>งาน</h2>
          <p>รายการงานที่ทีมต้องติดตามในรอบนี้</p>
        </div>
      </div>
      <DataTable columns={columns} rows={tasks} />
    </section>
  )
}

export default Tasks
