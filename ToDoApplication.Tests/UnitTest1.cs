using Xunit;


//Deneme yapmak i�in anlayabilmek i�nn yazd�m bu kodu testler nas�l �al���yor run edilir vb.
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