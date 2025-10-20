using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class LibraryDbContext : DbContext
    {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }

        public DbSet<Author> Authors => Set<Author>();
        public DbSet<Publisher> Publishers => Set<Publisher>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<BookAuthor> BookAuthors => Set<BookAuthor>();
        public DbSet<BookCategory> BookCategories => Set<BookCategory>();
        public DbSet<BookCopy> BookCopies => Set<BookCopy>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Staff> Staffs => Set<Staff>();
        public DbSet<Loan> Loans => Set<Loan>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<Fine> Fines => Set<Fine>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Authors
            modelBuilder.Entity<Author>(e =>
            {
                e.Property(x => x.FullName).IsRequired().HasMaxLength(255);
                e.Property(x => x.Nationality).HasMaxLength(100);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Publishers
            modelBuilder.Entity<Publisher>(e =>
            {
                e.Property(x => x.Name).IsRequired().HasMaxLength(255);
                e.Property(x => x.Email).HasMaxLength(100);
                e.Property(x => x.Website).HasMaxLength(255);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Categories (self reference)
            modelBuilder.Entity<Category>(e =>
            {
                e.Property(x => x.Name).IsRequired().HasMaxLength(100);
                e.HasOne(x => x.ParentCategory)
                    .WithMany(x => x.Children)
                    .HasForeignKey(x => x.ParentCategoryId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Books
            modelBuilder.Entity<Book>(e =>
            {
                e.Property(x => x.ISBN).HasMaxLength(20);
                e.Property(x => x.Title).IsRequired().HasMaxLength(255);
                e.Property(x => x.Edition).HasMaxLength(50);
                e.Property(x => x.Language).HasMaxLength(50).HasDefaultValue("Vietnamese");
                e.Property(x => x.CoverImageUrl).HasMaxLength(255);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.HasIndex(x => x.Title);
                e.HasIndex(x => x.ISBN);
            });

            // BookAuthor (many-to-many)
            modelBuilder.Entity<BookAuthor>(e =>
            {
                e.HasKey(x => new { x.BookId, x.AuthorId });
                e.Property(x => x.AuthorRole).HasConversion<string>().HasMaxLength(30);
                e.HasOne(x => x.Book).WithMany(x => x.BookAuthors).HasForeignKey(x => x.BookId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Author).WithMany(x => x.BookAuthors).HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Cascade);
            });

            // BookCategory (many-to-many)
            modelBuilder.Entity<BookCategory>(e =>
            {
                e.HasKey(x => new { x.BookId, x.CategoryId });
                e.HasOne(x => x.Book).WithMany(x => x.BookCategories).HasForeignKey(x => x.BookId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Category).WithMany(x => x.BookCategories).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
            });

            // BookCopy
            modelBuilder.Entity<BookCopy>(e =>
            {
                e.Property(x => x.Barcode).HasMaxLength(50);
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(CopyStatus.Available);
                e.Property(x => x.Location).HasMaxLength(100);
                e.Property(x => x.Price).HasColumnType("decimal(10,2)");
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.HasIndex(x => x.Status);
            });

            // Member
            modelBuilder.Entity<Member>(e =>
            {
                e.Property(x => x.MemberCode).IsRequired().HasMaxLength(20);
                e.HasIndex(x => x.MemberCode).IsUnique();
                e.Property(x => x.FullName).IsRequired().HasMaxLength(255);
                e.Property(x => x.Email).HasMaxLength(100);
                e.HasIndex(x => x.Email).IsUnique(false);
                e.Property(x => x.MembershipType).HasConversion<string>().HasMaxLength(30).HasDefaultValue(MembershipType.Community);
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).HasDefaultValue(MemberStatus.Active);
                e.Property(x => x.PasswordHash).HasMaxLength(255);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Staff
            modelBuilder.Entity<Staff>(e =>
            {
                e.Property(x => x.StaffCode).IsRequired().HasMaxLength(20);
                e.HasIndex(x => x.StaffCode).IsUnique();
                e.Property(x => x.FullName).IsRequired().HasMaxLength(255);
                e.Property(x => x.Email).IsRequired().HasMaxLength(100);
                e.HasIndex(x => x.Email).IsUnique();
                e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20).HasDefaultValue(StaffRole.Staff);
                e.Property(x => x.PasswordHash).IsRequired().HasMaxLength(255);
                e.Property(x => x.IsActive).HasDefaultValue(true);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Loan
            modelBuilder.Entity<Loan>(e =>
            {
                e.Property(x => x.LoanDate).IsRequired();
                e.Property(x => x.DueDate).IsRequired();
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(LoanStatus.Borrowing);
                e.Property(x => x.RenewalCount).HasDefaultValue(0);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.HasIndex(x => new { x.LoanDate, x.DueDate });
                e.HasIndex(x => x.Status);
            });

            // Reservation
            modelBuilder.Entity<Reservation>(e =>
            {
                e.Property(x => x.ReservationDate).IsRequired();
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(ReservationStatus.Pending);
                e.Property(x => x.Notified).HasDefaultValue(false);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.HasIndex(x => x.Status);
            });

            // Fine
            modelBuilder.Entity<Fine>(e =>
            {
                e.Property(x => x.FineType).HasConversion<string>().HasMaxLength(20);
                e.Property(x => x.Amount).HasColumnType("decimal(10,2)");
                e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(FineStatus.Unpaid);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                e.HasIndex(x => x.Status);
            });

            // Review
            modelBuilder.Entity<Review>(e =>
            {
                e.Property(x => x.Rating).IsRequired();
                e.Property(x => x.ReviewDate).HasDefaultValueSql("GETUTCDATE()");
                e.Property(x => x.IsApproved).HasDefaultValue(false);
            });

            // ActivityLog
            modelBuilder.Entity<ActivityLog>(e =>
            {
                e.Property(x => x.UserType).HasConversion<string>().HasMaxLength(10);
                e.Property(x => x.Action).HasMaxLength(100).IsRequired();
                e.Property(x => x.TableName).HasMaxLength(50);
                e.Property(x => x.IpAddress).HasMaxLength(45);
                e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
}
