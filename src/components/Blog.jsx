const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  const blogStyle = {
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10,
    border: 'solid', borderWidth: 1, marginBottom: 5, borderRadius: 5
  }

  const isCreator = blog.user && currentUser && blog.user.username === currentUser.username

  return (
    <div style={blogStyle}>
      <h3>{blog.title}</h3>
      <p>Author: {blog.author}</p>
      <p>URL: <a href={blog.url} target="_blank">{blog.url}</a></p>
      <p>
        Likes: {blog.likes} 
        <button onClick={() => handleLike(blog.id)} style={{marginLeft: 10}}>❤️ Like</button>
      </p>
      
      {isCreator && (
        <button onClick={() => handleDelete(blog.id)} style={{background: 'red', color: 'white'}}>
          🗑️ Delete
        </button>
      )}
    </div>
  )
}

export default Blog