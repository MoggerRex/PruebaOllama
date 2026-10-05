import BinarySearchVisualizer from '../components/algorithms/binarySearch/BinarySearchVisualizer.jsx';
import HashSearchVisualizer from '../components/algorithms/hashSearch/HashSearchVisualizer.jsx';
import InsertionSortVisualizer from '../components/algorithms/insertionSort/InsertionSortVisualizer.jsx';
import QuickSortVisualizer from '../components/algorithms/quickSort/QuickSortVisualizer.jsx';

export default function VisualizerDashboard() {
  return (
    <main className="visualizer-dashboard">
      <h1>Visualizador de algoritmos</h1>
      <BinarySearchVisualizer />
      <HashSearchVisualizer />
      <InsertionSortVisualizer />
      <QuickSortVisualizer />
    </main>
  );
}