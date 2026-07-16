package com.cloudnative.voting.dto;

/**
 * DTO for user registration.
 * If newOrganizationName is provided, a new organization is created and
 * the registering user becomes its ORGANIZATION_ADMIN.
 * If organizationId is provided, the user joins an existing org as a VOTER.
 */
public class RegisterRequest {

    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;

    /** Join an existing organization by ID. */
    private Long organizationId;

    /** Create a new organization with this name (user becomes ORGANIZATION_ADMIN). */
    private String newOrganizationName;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getNewOrganizationName() { return newOrganizationName; }
    public void setNewOrganizationName(String newOrganizationName) { this.newOrganizationName = newOrganizationName; }
}
