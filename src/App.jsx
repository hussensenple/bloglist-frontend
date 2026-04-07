import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      blogService.setToken(user.token)
      return user
    }
    return null
  })
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState({ text: null, type: '' })

  useEffect(() => {
    blogService.getAll().then(blogs => setBlogs(blogs))
  }, [])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: null, type: '' }), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      showMessage(`Welcome ${user.name}`)
    } catch (error) {
      console.error('Login error:', error)
      showMessage('Wrong credentials', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
  }

  const handleAddBlog = async (event) => {
    event.preventDefault()
    try {
      const newBlog = await blogService.create({ title, author, url })
      setBlogs(blogs.concat(newBlog)) 
      setTitle('')
      setAuthor('')
      setUrl('')
      showMessage(`A new blog ${newBlog.title} by ${newBlog.author} added`)
    } catch (error) {
      console.error('Add blog error:', error)
      showMessage('Failed to add blog', 'error')
    }
  }

  const handleLike = async (id) => {
    try {
      await blogService.updateLike(id)
      setBlogs(blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b))
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogService.remove(id)
        setBlogs(blogs.filter(b => b.id !== id))
        showMessage('Blog deleted successfully')
      } catch (error) {
        console.error('Delete error:', error)
        showMessage('Failed to delete blog', 'error')
      }
    }
  }

  if (user === null) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Log in to application</h2>
        <Notification message={message.text} type={message.type} />
        
        <form onSubmit={handleLogin}>
          <div>
            Username: 
            <input type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
          </div>
          <div>
            Password: 
            <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
          </div>
          <button type="submit" style={{ marginTop: 10 }}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Blogs Dashboard</h2>
      <Notification message={message.text} type={message.type} />
      
      <p>
        👤 <b>{user.name}</b> logged in 
        <button onClick={handleLogout} style={{ marginLeft: 10 }}>Logout</button>
      </p>

      <hr />

      <h3>Create New Blog</h3>
      <form onSubmit={handleAddBlog} style={{ marginBottom: 20 }}>
        <div>Title: <input value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div>Author: <input value={author} onChange={e => setAuthor(e.target.value)} /></div>
        <div>URL: <input value={url} onChange={e => setUrl(e.target.value)} /></div>
        <button type="submit" style={{ marginTop: 10, background: 'green', color: 'white' }}>Create</button>
      </form>

      <hr />

      <h3>All Blogs</h3>
      {blogs.map(blog =>
        <Blog 
          key={blog.id} 
          blog={blog} 
          handleLike={handleLike} 
          handleDelete={handleDelete}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default App