package com.LearnTrack.skilltrack_backend.controller;

import com.LearnTrack.skilltrack_backend.entity.ConsistencyLog;
import com.LearnTrack.skilltrack_backend.entity.ConsitencyTracker;
import com.LearnTrack.skilltrack_backend.repository.ConsistencyLogRepository;
import com.LearnTrack.skilltrack_backend.repository.ConsistencyTrackerRepository;
import com.LearnTrack.skilltrack_backend.service.ConsistencyTrackerServices;
import com.LearnTrack.skilltrack_backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "api/consistency")
@CrossOrigin(origins = "http://localhost:5173")
public class ConsistencyTrackerController {

    @Autowired
    private ConsistencyTrackerServices consistencyTrackerServices;

    @Autowired
    private ConsistencyTrackerRepository consistencyTrackerRepository;

    @Autowired
    private ConsistencyLogRepository consistencyLogRepository;

    @Autowired
    private SkillService skillService;

    @PostMapping("/mark")
    public ConsitencyTracker markStudy(@RequestBody ConsitencyTracker tracker) {
        return consistencyTrackerServices.markStudy(tracker);
    }

    @GetMapping("/{employeeId}")
    public List<ConsitencyTracker> getConsistency(@PathVariable Long employeeId){
        return consistencyTrackerServices.getConsistency(employeeId);
    }

//    @DeleteMapping("/{id}")
//    public void delete(@PathVariable Long id){
//        consistencyTrackerRepository.deleteById(id);
//    }

    @GetMapping("/streak/{employeeId}")
    public int getStreak(@PathVariable Long employeeId) {
        return consistencyTrackerServices.getLearningStreak(employeeId);
    }

//    @GetMapping("/employee/{employeeId}")
//    public List<ConsitencyTracker> getByEmployee(@PathVariable Long employeeId){
//        return consistencyTrackerRepository
//                .findByEmployeeIdOrderByDateDesc(employeeId);
//    }

    @PostMapping("/add")
    public String addLog(@RequestBody ConsistencyLog log) {
        return consistencyTrackerServices.addLog(log);
    }


    @GetMapping("/employee/{id}")
    public List<ConsistencyLog> getLogs(@PathVariable Long id) {
        return consistencyTrackerServices.getLogs(id);
    }

    // ✅ Tracker API (FOR STREAK)
    @GetMapping("/tracker/{id}")
    public List<ConsitencyTracker> getTracker(@PathVariable Long id) {
        return consistencyTrackerServices.getConsistency(id);
    }

    // ✅ Get logs
//    @GetMapping("/employee/{id}")
//    public List<ConsistencyLog> getLogs(@PathVariable int id) {
//        return consistencyTrackerServices.getLogs(id);
//    }
//
//    // ✅ Delete
//    @DeleteMapping("/{id}")
//    public String deleteLog(@PathVariable int id) {
//        return consistencyTrackerServices.deleteLog(id);
//    }

    @DeleteMapping("/{id}")
    public String deleteLog(@PathVariable Integer id) {
        consistencyTrackerServices.deleteLog(id);
        return "Deleted successfully";
    }

    @PutMapping("/update-progress/{skillId}")
    public String updateProgress(
            @PathVariable Long skillId,
            @RequestBody Map<String, Integer> body
    ) {
        int increment = body.get("increment");
        skillService.updateSkillProgress(skillId, increment);
        return "Updated";
    }

}
