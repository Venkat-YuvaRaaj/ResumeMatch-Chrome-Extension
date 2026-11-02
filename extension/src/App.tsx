
import { useState } from 'react'
import './App.css'

function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAnalyze() {
    if (!jobDescription.trim() || !resume) {
      setMessage('Please upload a resume and enter a job description.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('job_description', jobDescription)

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed')
      }

      setMessage(
        `Successfully analyzed ${data.filename}! ` +
        `Extracted ${data.resume_text.length} characters.`
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>ResumeMatch</h1>
        <p>Smart Resume & Job Description Analyzer</p>
      </header>

      <section className="card">
        <h2>Job Description</h2>
        <textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <h2>Upload Resume</h2>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) =>
            setResume(e.target.files?.[0] ?? null)
          }
        />

        {resume && <p>Selected: {resume.name}</p>}

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>

        {message && <p className="message">{message}</p>}
      </section>
    </div>
  )
}

export default App
