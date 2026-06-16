import ProgressBar from '../components/ProgressBar'

const projects = [
  { id: 'p-1', name: 'Influencer shortlist', progress: 80 },
  { id: 'p-2', name: 'Content review sprint', progress: 45 },
  { id: 'p-3', name: 'Monthly performance report', progress: 62 },
]

function Projects() {
  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h2>โปรเจกต์</h2>
          <p>จัดกลุ่มงานย่อยที่เกี่ยวข้องกับแต่ละแคมเปญ</p>
        </div>
      </div>
      <div className="card-grid">
        {projects.map((project) => (
          <article className="info-card" key={project.id}>
            <h3>{project.name}</h3>
            <ProgressBar value={project.progress} label="Progress" />
          </article>
        ))}
      </div>
    </section>
  )
}

export default Projects
