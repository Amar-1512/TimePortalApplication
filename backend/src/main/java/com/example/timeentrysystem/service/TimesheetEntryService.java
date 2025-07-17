package com.example.timeentrysystem.service;

import com.example.timeentrysystem.entity.TimesheetEntry;
import com.example.timeentrysystem.repository.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimesheetEntryService {

    @Autowired
    private TimesheetRepository repository;

    public List<TimesheetEntry> getAllEntries() {
        return repository.findAll();
    }

    public List<TimesheetEntry> getEntriesByEmployeeName(String employeeName) {
        return repository.findByEmployeeName(employeeName);
    }

    // Removed getEntriesByEmployeeId method as employeeId does not exist in entity

    public Optional<TimesheetEntry> getEntryById(Long id) {
        return repository.findById(id);
    }

    public boolean existsByEmployeeNameAndWeekStart(String employeeName, java.time.LocalDate weekStart) {
        return !repository.findByEmployeeNameAndWeekStart(employeeName, weekStart).isEmpty();
    }

    public TimesheetEntry createEntry(TimesheetEntry entry) {
        if (existsByEmployeeNameAndWeekStart(entry.getEmployeeName(), entry.getWeekStart())) {
            throw new IllegalArgumentException("You already entered the data for this week");
        }
        return repository.save(entry);
    }

    public TimesheetEntry updateEntry(Long id, TimesheetEntry updatedEntry) {
        return repository.findById(id)
                .map(entry -> {
                    entry.setEmployeeName(updatedEntry.getEmployeeName());
                    entry.setWeekStart(updatedEntry.getWeekStart());
                    entry.setWeekEnd(updatedEntry.getWeekEnd());
                    entry.setStatus(updatedEntry.getStatus());
                    entry.setTotalHours(updatedEntry.getTotalHours());
                    entry.setSubmittedDate(updatedEntry.getSubmittedDate());
                    entry.setMon(updatedEntry.getMon());
                    entry.setTue(updatedEntry.getTue());
                    entry.setWed(updatedEntry.getWed());
                    entry.setThu(updatedEntry.getThu());
                    entry.setFri(updatedEntry.getFri());
                    entry.setSat(updatedEntry.getSat());
                    entry.setSun(updatedEntry.getSun());
                    entry.setComments(updatedEntry.getComments());
                    return repository.save(entry);
                })
                .orElse(null);
    }

    public TimesheetEntry approveEntry(Long id) {
        return repository.findById(id)
                .map(entry -> {
                    entry.setStatus("approved");
                    return repository.save(entry);
                })
                .orElse(null);
    }

    public TimesheetEntry rejectEntry(Long id) {
        return repository.findById(id)
                .map(entry -> {
                    entry.setStatus("rejected");
                    return repository.save(entry);
                })
                .orElse(null);
    }

    public void deleteEntry(Long id) {
        repository.deleteById(id);
    }

    public TimesheetEntry updateStatus(Long id, String status) {
        return repository.findById(id)
                .map(entry -> {
                    entry.setStatus(status);
                    return repository.save(entry);
                })
                .orElse(null);
    }

    public List<TimesheetEntry> findByName(String name) {
        return repository.findByEmployeeName(name);
    }

    public List<TimesheetEntry> findByNameAndStatus(String name, String status) {
        return repository.findByEmployeeNameAndStatus(name, status);
    }
}
