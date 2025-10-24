using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Repositories;
using backend.Services;
using backend.Services.Author;
using backend.Services.Book;
using backend.Services.Category;
using backend.Services.Publisher;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ====================================
// CONFIGURE SERVICES
// ====================================

// 🔹 Database Context
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// 🔹 Core Services
builder.Services.AddScoped<ITokenService, TokenService>();

// 🔹 Author Module
builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();

// 🔹 Publisher Module
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IPublisherService, PublisherService>();

// 🔹 Category Module
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// 🔹 Book Module
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBookService, BookService>();

// 🔹 Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));


// ====================================
// BUILD APP
// ====================================

var app = builder.Build();

// ====================================
// CONFIGURE MIDDLEWARE PIPELINE
// ====================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
