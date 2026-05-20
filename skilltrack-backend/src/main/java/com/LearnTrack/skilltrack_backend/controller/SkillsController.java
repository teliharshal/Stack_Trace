package com.LearnTrack.skilltrack_backend.controller;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillEntity;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import com.LearnTrack.skilltrack_backend.service.ConsistencyTrackerServices;
import com.LearnTrack.skilltrack_backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employee/skills")
public class SkillsController {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillService skillService;

    @Autowired
    private ConsistencyTrackerServices consistencyTrackerServices;

    @Autowired
    private EmployeeRepository employeeRepository;

    public SkillsController(EmployeeSkillRepository employeeSkillRepository,
                            SkillService skillService) {
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillService = skillService;
    }

    // Employee adds a skill
    @PostMapping("/add")
    public EmployeeSkillEntity addSkill(@RequestBody EmployeeSkillEntity skill){
        return skillService.addSkill(skill);
    }


    // Get all skills for employee
    @GetMapping("/{employeeId}")
    public List<EmployeeSkillEntity> getSkillsByEmployee(@PathVariable Long employeeId){
        return employeeSkillRepository.findByEmployeeId(employeeId);
    }

//    @GetMapping("/overview/{employeeId}")
//    public List<EmployeeSkillEntity> getTopicAwareSkills(@PathVariable Long employeeId) {
//        return skillService.getTopicAwareSkills(employeeId);
//    }

    @GetMapping("/catalog")
    public List<com.LearnTrack.skilltrack_backend.entity.SkillEntity> getSkillCatalog() {
        return skillService.getSkill();
    }

    @GetMapping("/options")
    public List<Map<String, Object>> getSkillOptions() {
        List<Map<String, Object>> options = new ArrayList<>();
        Map<String, Map<String, Object>> unique = new LinkedHashMap<>();

        for (SkillEntity skill : skillService.getSkill()) {

            if (skill == null || skill.getSkillName() == null || skill.getSkillName().isBlank()) {
                continue;
            }

            String key = buildSkillKey(skill.getSkillName(), skill.getCategory());

            Map<String, Object> item = new HashMap<>();
            item.put("id", skill.getId());
            item.put("skillName", skill.getSkillName());
            item.put("category", skill.getCategory() == null ? "General" : skill.getCategory());
            item.put("source", "catalog");

            // ✅ ADD THIS LINE
            item.put("courseLink", skill.getCourseLink() == null ? "" : skill.getCourseLink());

            unique.put(key, item);
        }

        options.addAll(unique.values());
        return options;
    }

//        for (Map<String, Object> roadmapSkill : getRoadmapSkillOptions()) {
//            String skillName = String.valueOf(roadmapSkill.get("skillName"));
//            String category = String.valueOf(roadmapSkill.get("category"));
//            String key = buildSkillKey(skillName, category);
//
//            if (!unique.containsKey(key)) {
//                unique.put(key, roadmapSkill);
//            }
//        }

//        options.addAll(unique.values())
//        return options;

//    private List<Map<String, Object>> getRoadmapSkillOptions() {
//        List<Map<String, Object>> roadmapSkills = new ArrayList<>();
//
//        addRoadmapSkill(roadmapSkills, "HTML", "Frontend",
//                "Tags,Forms,Semantic HTML,SEO,Accessibility",
//                "Tags | https://www.w3schools.com/html/html_elements.asp\n" +
//                        "Forms | https://www.w3schools.com/html/html_forms.asp\n" +
//                        "Semantic HTML | https://developer.mozilla.org/en-US/docs/Glossary/Semantics\n" +
//                        "SEO | https://developer.mozilla.org/en-US/docs/Glossary/SEO\n" +
//                        "Accessibility | https://developer.mozilla.org/en-US/docs/Learn/Accessibility/What_is_accessibility");
//
//        addRoadmapSkill(roadmapSkills, "CSS", "Frontend",
//                "Flexbox,Grid,Responsive Design,Animations,Tailwind",
//                "Flexbox | https://www.w3schools.com/css/css3_flexbox.asp\n" +
//                        "Grid | https://www.w3schools.com/css/css_grid.asp\n" +
//                        "Responsive Design | https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design\n" +
//                        "Animations | https://www.w3schools.com/css/css3_animations.asp\n" +
//                        "Tailwind | https://tailwindcss.com/docs");
//
//        addRoadmapSkill(roadmapSkills, "JavaScript", "Frontend",
//                "DOM,Events,Promises,Async/Await,ES6+",
//                "DOM | https://www.w3schools.com/js/js_htmldom.asp\n" +
//                        "Events | https://www.w3schools.com/js/js_events.asp\n" +
//                        "Promises | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise\n" +
//                        "Async/Await | https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises\n" +
//                        "ES6+ | https://www.w3schools.com/js/js_es6.asp");
//
//        addRoadmapSkill(roadmapSkills, "React", "Frontend",
//                "Hooks,State,Props,Context API,Routing",
//                "Hooks | https://react.dev/learn\n" +
//                        "State | https://react.dev/learn/state-a-components-memory\n" +
//                        "Props | https://react.dev/learn/passing-props-to-a-component\n" +
//                        "Context API | https://react.dev/learn/passing-data-deeply-with-context\n" +
//                        "Routing | https://reactrouter.com/en/main");
//
//        addRoadmapSkill(roadmapSkills, "Next.js", "Frontend",
//                "SSR,Routing,API Routes,Optimization",
//                "SSR | https://nextjs.org/docs/app/building-your-application/rendering/server-components\n" +
//                        "Routing | https://nextjs.org/docs/app/building-your-application/routing\n" +
//                        "API Routes | https://nextjs.org/docs/pages/building-your-application/routing/api-routes\n" +
//                        "Optimization | https://nextjs.org/docs/app/building-your-application/optimizing");
//
//        addRoadmapSkill(roadmapSkills, "TypeScript", "Frontend",
//                "Types,Interfaces,Generics,Strict Mode",
//                "Types | https://www.typescriptlang.org/docs/handbook/2/everyday-types.html\n" +
//                        "Interfaces | https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces\n" +
//                        "Generics | https://www.typescriptlang.org/docs/handbook/2/generics.html\n" +
//                        "Strict Mode | https://www.typescriptlang.org/tsconfig/strict.html");
//
//        addRoadmapSkill(roadmapSkills, "Java Core & Advanced", "Backend",
//                "OOPs Concepts,Collections Framework,Java 8+ Streams,Exception Handling,Multithreading,Memory Management",
//                "OOPs Concepts | https://www.w3schools.com/java/java_polymorphism.asp\n" +
//                        "Collections Framework | https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/package-summary.html\n" +
//                        "Java 8+ Streams | https://www.baeldung.com/java-8-streams\n" +
//                        "Exception Handling | https://www.w3schools.com/java/java_try_catch.asp\n" +
//                        "Multithreading | https://www.w3schools.com/java/java_threads.asp\n" +
//                        "Memory Management | https://www.geeksforgeeks.org/memory-management-system-in-java/");
//
//        addRoadmapSkill(roadmapSkills, "Spring Boot", "Backend",
//                "Dependency Injection,Spring MVC,Spring Data JPA,Spring Security,Auto-Configuration,AOP & Logging",
//                "Dependency Injection | https://spring.io/guides/gs/handling-form-submission/\n" +
//                        "Spring MVC | https://spring.io/guides/gs/serving-web-content/\n" +
//                        "Spring Data JPA | https://spring.io/projects/spring-data-jpa\n" +
//                        "Spring Security | https://spring.io/projects/spring-security\n" +
//                        "Auto-Configuration | https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.auto-configuration\n" +
//                        "AOP & Logging | https://spring.io/guides/gs/caching/");
//
//        addRoadmapSkill(roadmapSkills, "REST API Design", "Backend",
//                "HTTP Methods,Status Codes,JSON/XML,Request/Response DTOs,Filtering & Sorting,API Documentation",
//                "HTTP Methods | https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods\n" +
//                        "Status Codes | https://developer.mozilla.org/en-US/docs/Web/HTTP/Status\n" +
//                        "JSON/XML | https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON\n" +
//                        "Request/Response DTOs | https://www.baeldung.com/java-dto-pattern\n" +
//                        "Filtering & Sorting | https://restfulapi.net/api-pagination-sorting-filtering/\n" +
//                        "API Documentation | https://swagger.io/docs/");
//
//        addRoadmapSkill(roadmapSkills, "Microservices", "Backend",
//                "Service Discovery,API Gateway,Circuit Breaker,Config Server,Distributed Tracing,Kafka/RabbitMQ",
//                "Service Discovery | https://spring.io/guides/gs/service-registration-and-discovery/\n" +
//                        "API Gateway | https://spring.io/projects/spring-cloud-gateway\n" +
//                        "Circuit Breaker | https://resilience4j.readme.io/docs/circuitbreaker\n" +
//                        "Config Server | https://spring.io/projects/spring-cloud-config\n" +
//                        "Distributed Tracing | https://opentelemetry.io/docs/\n" +
//                        "Kafka/RabbitMQ | https://kafka.apache.org/documentation/");
//
//        addRoadmapSkill(roadmapSkills, "Docker & DevOps", "Backend",
//                "Docker Images,Containers vs VMs,Docker Compose,CI/CD Pipelines,Kubernetes Basics,AWS Deployment",
//                "Docker Images | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/\n" +
//                        "Containers vs VMs | https://www.docker.com/resources/what-container/\n" +
//                        "Docker Compose | https://docs.docker.com/compose/\n" +
//                        "CI/CD Pipelines | https://docs.github.com/actions\n" +
//                        "Kubernetes Basics | https://kubernetes.io/docs/tutorials/kubernetes-basics/\n" +
//                        "AWS Deployment | https://docs.aws.amazon.com/");
//
//        addRoadmapSkill(roadmapSkills, "System Design", "Backend",
//                "Load Balancing,Caching (Redis),Database Sharding,Vertical vs Horizontal Scaling,CAP Theorem,Rate Limiting",
//                "Load Balancing | https://aws.amazon.com/elasticloadbalancing/\n" +
//                        "Caching (Redis) | https://redis.io/docs/latest/\n" +
//                        "Database Sharding | https://www.geeksforgeeks.org/what-is-database-sharding/\n" +
//                        "Vertical vs Horizontal Scaling | https://www.ibm.com/topics/vertical-scaling-vs-horizontal-scaling\n" +
//                        "CAP Theorem | https://www.geeksforgeeks.org/cap-theorem-in-dbms/\n" +
//                        "Rate Limiting | https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After");
//
//        addRoadmapSkill(roadmapSkills, "Linux", "DevOps",
//                "Commands,File System,Permissions,Shell Scripting,Cron Jobs,SSH",
//                "Commands | https://linuxjourney.com/lesson/the-shell\n" +
//                        "File System | https://linuxjourney.com/lesson/file-system-hierarchy\n" +
//                        "Permissions | https://linuxjourney.com/lesson/file-permissions\n" +
//                        "Shell Scripting | https://www.shellcheck.net/\n" +
//                        "Cron Jobs | https://www.geeksforgeeks.org/crontab-in-linux-with-examples/\n" +
//                        "SSH | https://www.ssh.com/academy/ssh");
//
//        addRoadmapSkill(roadmapSkills, "Git", "DevOps",
//                "Git Basics,Branching,Merging,Rebase,Cherry-pick,Stashing",
//                "Git Basics | https://git-scm.com/docs/gittutorial\n" +
//                        "Branching | https://www.atlassian.com/git/tutorials/using-branches\n" +
//                        "Merging | https://www.atlassian.com/git/tutorials/using-branches/git-merge\n" +
//                        "Rebase | https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase\n" +
//                        "Cherry-pick | https://www.atlassian.com/git/tutorials/cherry-pick\n" +
//                        "Stashing | https://www.atlassian.com/git/tutorials/saving-changes/git-stash");
//
//        addRoadmapSkill(roadmapSkills, "Docker", "DevOps",
//                "Images,Containers,Dockerfile,Docker Compose,Volumes,Networking",
//                "Images | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/\n" +
//                        "Containers | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/\n" +
//                        "Dockerfile | https://docs.docker.com/reference/dockerfile/\n" +
//                        "Docker Compose | https://docs.docker.com/compose/\n" +
//                        "Volumes | https://docs.docker.com/storage/volumes/\n" +
//                        "Networking | https://docs.docker.com/network/");
//
//        addRoadmapSkill(roadmapSkills, "Kubernetes", "DevOps",
//                "Pods,Deployments,Services,ConfigMaps,Ingress,Helm Charts",
//                "Pods | https://kubernetes.io/docs/concepts/workloads/pods/\n" +
//                        "Deployments | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/\n" +
//                        "Services | https://kubernetes.io/docs/concepts/services-networking/service/\n" +
//                        "ConfigMaps | https://kubernetes.io/docs/concepts/configuration/configmap/\n" +
//                        "Ingress | https://kubernetes.io/docs/concepts/services-networking/ingress/\n" +
//                        "Helm Charts | https://helm.sh/docs/");
//
//        addRoadmapSkill(roadmapSkills, "CI/CD", "DevOps",
//                "Jenkins,GitHub Actions,Pipelines,Artifactory,Webhooks,Testing",
//                "Jenkins | https://www.jenkins.io/doc/\n" +
//                        "GitHub Actions | https://docs.github.com/actions\n" +
//                        "Pipelines | https://www.atlassian.com/continuous-delivery/continuous-integration\n" +
//                        "Artifactory | https://jfrog.com/artifactory/\n" +
//                        "Webhooks | https://docs.github.com/webhooks\n" +
//                        "Testing | https://www.atlassian.com/continuous-delivery/software-testing/what-is-software-testing");
//
//        addRoadmapSkill(roadmapSkills, "Cloud (AWS)", "DevOps",
//                "EC2,S3,IAM,VPC,Lambda,Route 53",
//                "EC2 | https://docs.aws.amazon.com/ec2/\n" +
//                        "S3 | https://docs.aws.amazon.com/s3/\n" +
//                        "IAM | https://docs.aws.amazon.com/iam/\n" +
//                        "VPC | https://docs.aws.amazon.com/vpc/\n" +
//                        "Lambda | https://docs.aws.amazon.com/lambda/\n" +
//                        "Route 53 | https://docs.aws.amazon.com/route53/");
//
//        return roadmapSkills;
//    }

    private void addRoadmapSkill(List<Map<String, Object>> skills, String skillName, String category, String topics, String topicLinks) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", "roadmap-" + buildSkillKey(skillName, category));
        item.put("skillName", skillName);
        item.put("category", category);
        item.put("topics", topics);
        item.put("topicLinks", topicLinks);
        item.put("source", "roadmap");
        skills.add(item);
    }

    private String buildSkillKey(String skillName, String category) {
        String normalizedName = skillName == null ? "" : skillName.trim().toLowerCase();
        String normalizedCategory = category == null ? "general" : category.trim().toLowerCase();
        return normalizedName + "|" + normalizedCategory;
    }

    // Update progress
    @PutMapping("/progress/{id}")
    public EmployeeSkillEntity updateProgress(@PathVariable Long id,
                                              @RequestBody EmployeeSkillEntity request){

        EmployeeSkillEntity skill =
                employeeSkillRepository.findById(id).orElseThrow();

        skill.setProgressPercentage(request.getProgressPercentage());

        if(request.getProgressPercentage() == 100){
            skill.setStatus("COMPLETED");
            skill.setCompletedAt(LocalDate.now());
        }

        return employeeSkillRepository.save(skill);
    }

//    @PutMapping("/topics/{id}")
//    public EmployeeSkillEntity updateTopicProgress(@PathVariable Long id,
//                                                   @RequestBody Map<String, Object> request) {
//        String topic = request.get("topic") == null ? "" : String.valueOf(request.get("topic")).trim();
//        boolean completed = Boolean.parseBoolean(String.valueOf(request.getOrDefault("completed", false)));
//
//        if (topic.isBlank()) {
//            throw new RuntimeException("Topic is required");
//        }
//        return skillService.updateTopicCompletion(id, topic, completed);
//    }

    // Delete skill
    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable Long id){
        employeeSkillRepository.deleteById(id);
    }

    // Dashboard APIs
    @GetMapping("/dashboard/in-progress/{employeeId}")
    public List<EmployeeSkillEntity> skillsInProgress(@PathVariable Long employeeId){
        return skillService.getInProgressStatus(employeeId);
    }

    @GetMapping("/dashboard/completed/{employeeId}")
    public List<EmployeeSkillEntity> skillsCompleted(@PathVariable Long employeeId){
        return skillService.getCompletedStatus(employeeId);
    }


    @GetMapping("/dashboard/total-skills")
    public long getTotalSkills(){
        return skillService.getTotalSkills();
    }

    @GetMapping("/remaining-days/{id}")
    public long remainingDays(@PathVariable Long id){
      return skillService.getRemainingDays(id);
    }

    private Set<String> parseCompletedTopics(String topicsText) {
        if (topicsText == null || topicsText.isBlank()) {
            return new LinkedHashSet<>();
        }

        return List.of(topicsText.split(","))
                .stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(topic -> !topic.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

//    @GetMapping("/streak/{employeeId}")
//    public int getStreak(@PathVariable Long employeeId){
//
//        return consistencyTrackerServices .getLearningStreaks(employeeId);
//
//    }
}

