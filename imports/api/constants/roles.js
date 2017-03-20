
export const ADMIN_ROLE = 'admin';
export const SUPER_ADMIN_ROLE = 'superAdmin';

//users
export const DEFAULT_USER_GROUP = 'users';

export const STAKEHOLDER_ROLE = 'stakeholder';
export const VENDOR_ROLE = 'vendor';
export const EMPLOYEE_ROLE = 'employee';
export const SHIPPER_ROLE = 'shipper';

export const ADMIN_ROLE_LIST = [ADMIN_ROLE,SUPER_ADMIN_ROLE];
export const NOT_ADMIN_LIST = [STAKEHOLDER_ROLE,VENDOR_ROLE,EMPLOYEE_ROLE,SHIPPER_ROLE];
export const USER_ROLE_LIST = [STAKEHOLDER_ROLE,VENDOR_ROLE,EMPLOYEE_ROLE,SHIPPER_ROLE,ADMIN_ROLE];
export const ALL_ROLES = [...USER_ROLE_LIST, SUPER_ADMIN_ROLE];
