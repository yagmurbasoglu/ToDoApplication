using Xunit;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToDoApplication.API.Services;
using ToDoApplication.API.Models;
using ToDoApplication.API.Repositories;
using ToDoApplication.API.DTOs;
using System.Linq;

namespace ToDoApplication.Tests.Services
{
    public class TodoServiceTests
    {
        // CreateAsync testleri
        [Fact]
        public async Task CreateAsync_ShouldCallRepositoryAndReturnDto()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            var todoToCreate = new Todo { Id = 1, Title = "Test Todo", IsCompleted = false };

            mockRepo.Setup(r => r.CreateAsync(It.IsAny<Todo>())).ReturnsAsync(todoToCreate);

            var service = new TodoService(mockRepo.Object);
            var dto = new TodoCreateDto { Title = "Test Todo" };

            // Act
            var result = await service.CreateAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Test Todo", result.Title);
            Assert.False(result.IsCompleted);
            mockRepo.Verify(r => r.CreateAsync(It.IsAny<Todo>()), Times.Once);
        }

        // GetAllAsync testleri
        [Fact]
        public async Task GetAllAsync_ShouldReturnListOfTodos()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Todo>
            {
                new Todo { Id = 1, Title = "Test 1", IsCompleted = false },
                new Todo { Id = 2, Title = "Test 2", IsCompleted = true }
            });

            var service = new TodoService(mockRepo.Object);

            // Act
            var result = await service.GetAllAsync();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, t => t.Title == "Test 1");
            Assert.Contains(result, t => t.Title == "Test 2");
        }

        // 📌 GetByIdAsync testleri
        [Fact]
        public async Task GetByIdAsync_ShouldReturnTodo_WhenExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Todo { Id = 1, Title = "Test Todo", IsCompleted = false });

            var service = new TodoService(mockRepo.Object);

            // Act
            var result = await service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Test Todo", result.Title);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Todo?)null);

            var service = new TodoService(mockRepo.Object);

            // Act
            var result = await service.GetByIdAsync(99);

            // Assert
            Assert.Null(result);
        }

        // 📌 UpdateAsync testleri
        [Fact]
        public async Task UpdateAsync_ShouldReturnTrue_WhenTodoExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Todo { Id = 1, Title = "Old Title" });
            mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Todo>())).Returns(Task.CompletedTask);

            var service = new TodoService(mockRepo.Object);
            var dto = new TodoCreateDto { Title = "New Title" };

            // Act
            var result = await service.UpdateAsync(1, dto);

            // Assert
            Assert.True(result);
            mockRepo.Verify(r => r.UpdateAsync(It.Is<Todo>(t => t.Title == "New Title")), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnFalse_WhenTodoNotExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Todo?)null);

            var service = new TodoService(mockRepo.Object);
            var dto = new TodoCreateDto { Title = "Does Not Matter" };

            // Act
            var result = await service.UpdateAsync(99, dto);

            // Assert
            Assert.False(result);
            mockRepo.Verify(r => r.UpdateAsync(It.IsAny<Todo>()), Times.Never);
        }

        // 📌 DeleteAsync testleri
        [Fact]
        public async Task DeleteAsync_ShouldReturnTrue_WhenTodoExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Todo { Id = 1, Title = "Test Todo" });
            mockRepo.Setup(r => r.DeleteAsync(It.IsAny<Todo>())).Returns(Task.CompletedTask);

            var service = new TodoService(mockRepo.Object);

            // Act
            var result = await service.DeleteAsync(1);

            // Assert
            Assert.True(result);
            mockRepo.Verify(r => r.DeleteAsync(It.Is<Todo>(t => t.Id == 1)), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnFalse_WhenTodoNotExists()
        {
            // Arrange
            var mockRepo = new Mock<ITodoRepository>();
            mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Todo?)null);

            var service = new TodoService(mockRepo.Object);

            // Act
            var result = await service.DeleteAsync(99);

            // Assert
            Assert.False(result);
            mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Todo>()), Times.Never);
        }
    }
}
