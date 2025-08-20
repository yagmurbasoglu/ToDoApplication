using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApplication.API.DTOs;
using ToDoApplication.API.Models;
using ToDoApplication.API.Services;
using BCrypt.Net;
using ToDoApplication.API.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System;

namespace ToDoApplication.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly AppDbContext _context;

        public UserController(TokenService tokenService, AppDbContext context)
        {
            _tokenService = tokenService;
            _context = context;
        }

        // Kayıt işlemi
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto userDto)
        {
            // Zaten kayıtlı mı kontrol et
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
            if (existingUser != null)
            {
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");
            }

            // Şifreyi hashle
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password);

            // Yeni kullanıcı oluştur
            var newUser = new User
            {
                Email = userDto.Email,
                PasswordHash = passwordHash
            };

            // DB'ye kaydet
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok("Kayıt başarılı");
        }
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";

            return Ok(new { Id = userId, Email = email });
        }


        // Giriş işlemi
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // E-posta yoksa ya da şifre uyuşmuyorsa
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı");
            }

            var token = _tokenService.CreateToken(user);
            return Ok(new { Token = token });
        }
    }
}
