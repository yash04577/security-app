enum RoleIndex{
    ADMIN="ADMIN",
    EMPLOYEE="EMPLOYEE",
    UNKNOWN="UNKNOWN"
}
export default RoleIndex;
export type Roles=keyof typeof RoleIndex;
