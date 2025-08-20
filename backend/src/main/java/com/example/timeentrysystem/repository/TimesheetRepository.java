package com.example.timeentrysystem.repository;

import com.example.timeentrysystem.entity.TimesheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimesheetRepository extends JpaRepository<TimesheetEntry, Long> {
    List<TimesheetEntry> findByEmployeeName(String name);

    List<TimesheetEntry> findByEmployeeNameAndStatus(String name, String status);

    List<TimesheetEntry> findByEmployeeNameAndWeekStart(String employeeName, LocalDate weekStart);

    // Removed findByEmployeeId method as employeeId does not exist in entity
}
