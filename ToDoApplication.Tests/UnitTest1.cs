using Xunit;


//Deneme yapmak için anlayabilmek içnn yazdým bu kodu testler nasýl çalýþýyor run edilir vb.
namespace ToDoApplication.Tests
{
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            int result = 2 + 3;
            Assert.Equal(5, result);
        }
    }
}