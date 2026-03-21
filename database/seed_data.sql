-- Seed Roles
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (id, name, description) VALUES
(1, 'Admin', N'Quản trị viên hệ thống'),
(2, 'Receptionist', N'Nhân viên lễ tân'),
(3, 'Housekeeping', N'Nhân viên dọn phòng'),
(4, 'Guest', N'Khách hàng');
SET IDENTITY_INSERT Roles OFF;

-- Seed Permissions
SET IDENTITY_INSERT Permissions ON;
INSERT INTO Permissions (id, name) VALUES
(1, 'manage_users'),
(2, 'manage_roles'),
(3, 'manage_rooms'),
(4, 'manage_bookings'),
(5, 'manage_services'),
(6, 'view_reports'),
(7, 'manage_housekeeping'),
(8, 'view_own_bookings');
SET IDENTITY_INSERT Permissions OFF;

-- Seed Role_Permissions Mapping
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
-- Admin
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Receptionist
(2, 3), (2, 4), (2, 5), (2, 6),
-- Housekeeping
(3, 7),
-- Guest
(4, 8);
