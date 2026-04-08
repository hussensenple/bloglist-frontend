import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'

import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification' 

import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const parsedUser = JSON.parse(loggedUserJSON)
      blogService.setToken(parsedUser.token)
      return parsedUser
    }
    return null
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ text: null, type: '' })

  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll().then(initialBlogs =>
      setBlogs(initialBlogs.data) 
    ).catch(error => {
      console.error("Error fetching blogs:", error)
    })
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user)) 
      blogService.setToken(user.token)
      
      setUser(user)
      setUsername('')
      setPassword('')
      showMessage('Successfully logged in!', 'success')
      navigate('/')
    } catch (error) { 
      console.error(error)
      showMessage('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    navigate('/')
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      // تأكد إن blogs عبارة عن array قبل ما تستخدم concat
      const currentBlogs = Array.isArray(blogs) ? blogs : []
      setBlogs(currentBlogs.concat(returnedBlog))
      showMessage(`A new blog ${returnedBlog.title} by ${returnedBlog.author} added`, 'success')
      navigate('/') 
    } catch (error) {
      console.error(error)
      showMessage('Error adding blog', 'error')
    }
  }

  const addLike = async (id, updatedBlogObject) => {
    try {
      const returnedBlog = await blogService.update(id, updatedBlogObject)
      const currentBlogs = Array.isArray(blogs) ? blogs : []
      setBlogs(currentBlogs.map(blog => blog.id !== id ? blog : returnedBlog))
    } catch (error) {
      console.error(error)
      showMessage('Error updating likes', 'error')
    }
  }

  const deleteBlog = async (id, blogTitle) => {
    if (window.confirm(`Remove blog ${blogTitle}?`)) {
      try {
        await blogService.remove(id)
        const currentBlogs = Array.isArray(blogs) ? blogs : []
        setBlogs(currentBlogs.filter(blog => blog.id !== id))
        showMessage('Blog removed successfully', 'success')
      } catch (error) {
        console.error(error)
        showMessage('Error removing blog', 'error')
      }
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage({ text: null, type: '' })
    }, 5000)
  }

  return (
    <div>
      <div style={{ backgroundColor: 'lightgray', padding: '10px', marginBottom: '20px' }}>
        <Link to="/" style={{ padding: 5, textDecoration: 'none', color: 'blue' }}>blogs</Link>
        
        {user ? (
          <>
            <Link to="/create" style={{ padding: 5, textDecoration: 'none', color: 'blue' }}>create new</Link>
            <span style={{ paddingLeft: 10 }}>{user.name} logged in</span>
            <button onClick={handleLogout} style={{ marginLeft: 10 }}>logout</button>
          </>
        ) : (
          <Link to="/login" style={{ padding: 5, textDecoration: 'none', color: 'blue' }}>login</Link>
        )}
      </div>

      <h2>blog app</h2>
      <Notification message={message.text} type={message.type} />

      <Routes>
        <Route path="/" element={
          <div>
            {Array.isArray(blogs) ? (
              [...blogs].sort((a, b) => b.likes - a.likes).map(blog =>
                <Blog 
                  key={blog.id} 
                  blog={blog} 
                  addLike={addLike} 
                  deleteBlog={deleteBlog} 
                  user={user} 
                />
              )
            ) : (
              <p>Error loading blogs. Please check the backend server.</p>
            )}
          </div>
        } />
        
        <Route path="/create" element={
          user ? <BlogForm createBlog={addBlog} /> : <Navigate to="/login" />
        } />

        <Route path="/login" element={
          user ? <Navigate to="/" /> : (
            <div>
              <h2>Log in to application</h2>
              <form onSubmit={handleLogin}>
                <div>
                  username
                  <input
                    type="text"
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                  />
                </div>
                <div>
                  password
                  <input
                    type="password"
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                  />
                </div>
                <button type="submit">login</button>
              </form>
            </div>
          )
        } />
      </Routes>
    </div>
  )
}

export default App