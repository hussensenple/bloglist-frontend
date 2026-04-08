import { useState } from 'react'

const Blog = ({ blog, addLike, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 10,
    paddingBottom: 10,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    borderRadius: '5px' 
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1
    }
    addLike(blog.id, updatedBlog)
  }

  const handleDelete = () => {
    deleteBlog(blog.id, blog.title)
  }

  // التعديل هنا: بنعمل متغير يتأكد إن اليوزر الحالي هو صاحب المدونة
  // بنقارن بالـ username لأن ده بيكون دايماً مميز لكل يوزر
  const isCreator = user && blog.user && (user.username === blog.user.username || user.id === blog.user)

  return (
    <div style={blogStyle} className='blog'>
      <div>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{blog.title}</span>
        <button style={{ marginLeft: '15px' }} onClick={() => setVisible(!visible)}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div style={{ marginTop: '10px', paddingLeft: '5px' }}>
          <p style={{ margin: '5px 0' }}><b>Author:</b> {blog.author}</p>
          <p style={{ margin: '5px 0' }}><b>URL:</b> <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a></p>
          <p style={{ margin: '5px 0' }}>
            <b>Likes:</b> {blog.likes} 
            <button style={{ marginLeft: '10px' }} onClick={handleLike}>like</button>
          </p>
          <p style={{ margin: '5px 0' }}><b>Added by:</b> {blog.user ? (blog.user.name || blog.user.username) : 'Unknown User'}</p>
          
          {/* بنستخدم المتغير الجديد هنا عشان نظهر زرار المسح */}
          {isCreator && (
            <button 
              onClick={handleDelete} 
              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', marginTop: '10px', cursor: 'pointer' }}
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog