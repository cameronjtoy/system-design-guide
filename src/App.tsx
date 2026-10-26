import { HashRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { PrinciplesIndex } from './pages/PrinciplesIndex'
import { CollectionIndex } from './pages/CollectionIndex'
import { EntryPage } from './pages/EntryPage'
import { Reading } from './pages/Reading'
import { PathPage, PathsIndex } from './pages/Paths'
import { Progress } from './pages/Progress'
import { QuickPractice } from './pages/QuickPractice'
import { NotFound } from './pages/NotFound'

// Hash URLs (/#/principles/...) because GitHub Pages can't route deep links in
// a single-page app.
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="principles" element={<PrinciplesIndex />} />
          <Route path="principles/:slug" element={<EntryPage collection="principles" />} />
          <Route path="postmortems" element={<CollectionIndex collection="postmortems" />} />
          <Route path="postmortems/:slug" element={<EntryPage collection="postmortems" />} />
          <Route path="case-studies" element={<CollectionIndex collection="case-studies" />} />
          <Route path="case-studies/:slug" element={<EntryPage collection="case-studies" />} />
          <Route path="practice" element={<CollectionIndex collection="practice" />} />
          <Route path="practice/:slug" element={<EntryPage collection="practice" />} />
          <Route path="paths" element={<PathsIndex />} />
          <Route path="paths/:slug" element={<PathPage />} />
          <Route path="progress" element={<Progress />} />
          <Route path="quiz" element={<QuickPractice />} />
          <Route path="reading" element={<Reading />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
