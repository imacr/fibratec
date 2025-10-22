import Table from 'react-bootstrap/Table';
import ReactDOM from "react-dom";
import React, { useEffect } from "react";

    
export default function Dashboard() {
  return (
    <Table striped bordered hover>
      <thead className='estilo_tabla'>
        <tr>
          <th>#</th>
          <th>Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, repellendus. Placeat blanditiis repellendus voluptatum, quas nulla obcaecati quisquam, sed atque fuga deserunt consequuntur deleniti itaque omnis ut fugiat consectetur voluptate.</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam corporis at minima quae nihil rem, consectetur recusandae dignissimos, in quidem autem, officiis quaerat quam? Temporibus dolore asperiores magni delectus enim?</td>
          <td>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores incidunt, numquam, repudiandae dignissimos fugiat beatae commodi optio accusantium quos veritatis laborum dolore laboriosam amet ducimus vel temporibus similique. Rerum, mollitia.</td>
        </tr>
        <tr>
          <td>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quasi eligendi obcaecati cum mollitia voluptate? Consectetur, doloremque? Sed voluptatem eaque, aliquid maxime excepturi nihil? Laborum ullam possimus incidunt alias, libero commodi.</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
  );
}

