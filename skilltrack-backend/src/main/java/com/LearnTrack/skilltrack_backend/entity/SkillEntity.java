package com.LearnTrack.skilltrack_backend.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SkillEntity {

    public Long getId() {
        return id;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String skillName;
    private String category;

    public String getCourseLink() {
        return courseLink;
    }

    private String courseLink;

    public void setCourseLink(String courseLink) {
        this.courseLink = courseLink;
    }
}
