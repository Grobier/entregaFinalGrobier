document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');
  
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (event) => {
        const productId = event.target.dataset.id;
  
        if (confirm("¿Seguro que querés eliminar este producto?")) {
          try {
            const response = await fetch(`/api/products/${productId}`, {
              method: 'DELETE'
            });
  
            if (response.ok) {
              alert('Producto eliminado correctamente');
              window.location.reload();
            } else {
              alert('Error al eliminar el producto');
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }
      });
    });
  });
  