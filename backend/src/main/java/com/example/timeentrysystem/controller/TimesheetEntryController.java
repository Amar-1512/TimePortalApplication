package com.example.timeentrysystem.controller;

import com.example.timeentrysystem.entity.TimesheetEntry;
import com.example.timeentrysystem.service.TimesheetEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timesheet-entries")

public class TimesheetEntryController {

    @Autowired
    private TimesheetEntryService service;

    @GetMapping
    public ResponseEntity<List<TimesheetEntry>> getAllEntries(@RequestParam(required = false) String employeeName) {
        if (employeeName != null) {
            return ResponseEntity.ok(service.getEntriesByEmployeeName(employeeName));
        } else {
            return ResponseEntity.ok(service.getAllEntries());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimesheetEntry> getEntryById(@PathVariable Long id) {
        return service.getEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEntry(@RequestBody TimesheetEntry entry) {
        try {
            TimesheetEntry created = service.createEntry(entry);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimesheetEntry> updateEntry(@PathVariable Long id, @RequestBody TimesheetEntry updatedEntry) {
        TimesheetEntry updated = service.updateEntry(id, updatedEntry);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TimesheetEntry> approveEntry(@PathVariable Long id) {
        TimesheetEntry approved = service.approveEntry(id);
        return (approved != null) ? ResponseEntity.ok(approved) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TimesheetEntry> rejectEntry(@PathVariable Long id) {
        TimesheetEntry rejected = service.rejectEntry(id);
        return (rejected != null) ? ResponseEntity.ok(rejected) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TimesheetEntry> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        TimesheetEntry updated = service.updateStatus(id, request.getStatus());
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    @GetMapping("/employeename")
    public ResponseEntity<List<TimesheetEntry>> findByName(@RequestParam String name) {
        return ResponseEntity.ok(service.findByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TimesheetEntry>> findByNameAndStatus(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status) {
        if (name != null && status != null) {
            return ResponseEntity.ok(service.findByNameAndStatus(name, status));
        } else if (name != null) {
            return ResponseEntity.ok(service.findByName(name));
        } else {
            return ResponseEntity.ok(service.getAllEntries());
        }
    }
}
