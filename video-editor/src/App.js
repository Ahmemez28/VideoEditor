import { BrowserRouter, Routes, Route } from "react-router-dom";
import MakeClips from "./pages/MakeClips";
import VideoClips from "./pages/VideoClips";
import ClipList from "./pages/ClipList";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" >
          <Route index element={<MakeClips />} />
          <Route path="clips"  element={<ClipList />} />
          <Route path="clips/:filename" element={<VideoClips />} />
          <Route path="*" element={<div class="App-header">No Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
