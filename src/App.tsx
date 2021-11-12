import * as React from 'react'
import { Routes, Route, Link, useOutlet, useLocation, matchPath } from 'react-router-dom'
const KeepAliveContext = React.createContext({});

function Counter() {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount((count) => count + 1)}>Add</button>
    </div>
  )
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
      <Counter />
    </div>
  )
}

function About() {
  const { dropByCacheKey } = React.useContext<any>(KeepAliveContext);
  return (
    <div>
      <h2>About</h2>
      <Counter />
      <button onClick={() => dropByCacheKey('/about')}>dropByCacheKey</button>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <Counter />
    </div>
  )
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  )
}

const isKeepPath = (aliveList: any[], path: string) => {
  let isKeep = false;
  aliveList.map(item => {
    if (item === path) {
      isKeep = true;
    }
    if (item instanceof RegExp && item.test(path)) {
      isKeep = true;
    }
    if (typeof item === 'string' && item.toLowerCase() === path) {
      isKeep = true;
    }
  })
  return isKeep;
}
function useKeepOutlets() {
  const location = useLocation()
  const element = useOutlet()
  const { keepElements, keepalive } = React.useContext<any>(KeepAliveContext);
  const isKeep = isKeepPath(keepalive, location.pathname);
  if (isKeep) {
    keepElements.current[location.pathname] = element;
  }
  return <>
    {
      Object.entries(keepElements.current).map(([pathname, element]: any) => (
        <div key={pathname} style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden auto' }} hidden={!matchPath(location.pathname, pathname)}>
          {element}
        </div>
      ))
    }
    <div hidden={isKeep} style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden auto' }} className="rumtime-keep-alive-layout-no">
      {!isKeep && element}
    </div>
  </>
}

function Layout() {
  const keepOutlets = useKeepOutlets();
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>
      <hr />
      {keepOutlets}
    </div>
  )
}

export default function App() {
  const keepElements = React.useRef<any>({})
  // keepElements.current[location.pathname] = element;
  function dropByCacheKey(path: string) {
    keepElements.current[path] = null;
  }
  return (
    <KeepAliveContext.Provider value={{ keepalive: ['/about'], keepElements, dropByCacheKey }} >
      <h1>Basic Example</h1>

      <p>
        This example demonstrates some of the core features of React Router including nested <code>&lt;Route&gt;</code>
        s, <code>&lt;Outlet&gt;</code>s, <code>&lt;Link&gt;</code>s, and using a "*" route (aka "splat route") to render
        a "not found" page when someone visits an unrecognized URL.
      </p>

      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </KeepAliveContext.Provider>
  )
}
