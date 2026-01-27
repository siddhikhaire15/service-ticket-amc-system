export default function AdminDashboardContent() {
  return (
    <section className="content">
      
      {/* RECENT TICKETS */}
      <div className="table-box">
        <h3>Recent Tickets</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>#1023</td>
              <td>Printer not working</td>
              <td><span className="badge open">Open</span></td>
              <td>High</td>
              <td>Vijay</td>
            </tr>

            <tr>
              <td>#1018</td>
              <td>Network Issue</td>
              <td><span className="badge progress">In Progress</span></td>
              <td>Medium</td>
              <td>Archana</td>
            </tr>

            <tr>
              <td>#1015</td>
              <td>Software Installation</td>
              <td><span className="badge resolved">Resolved</span></td>
              <td>Low</td>
              <td>Siddhi</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* AMC PANEL */}
      <div className="side-box">
        <h3>Upcoming AMC Renewals</h3>

        <div className="amc-item">
          <strong>ABC Corp</strong>
          <span>Renew by Aug 15</span>
        </div>

        <div className="amc-item">
          <strong>XYZ Ltd</strong>
          <span>Renew by Sep 01</span>
        </div>

        <div className="amc-item">
          <strong>Tech Solutions</strong>
          <span>Renew by Sep 10</span>
        </div>
      </div>

    </section>
  );
}
