'use client';

import { useEffect, useState, FormEvent } from 'react';
import styles from './Home.module.css';

// Update the interface definitions
interface Link {
  rel: string;
  href: string;
}

interface Customer {
  id: string;
  links: Link[];
}

interface CustomerResponse {
  items: Customer[];
  count: number;
  hasMore: boolean;
  offset: number;
  totalResults: number;
}

interface Subsidiary {
  id: string;
  refName: string;
}

interface NewCustomer {
  companyName: string;
  subsidiary: Subsidiary;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    companyName: '',
    subsidiary: { id: '1', refName: 'Parent Company' }
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/netsuite');
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: CustomerResponse = await response.json();
        if (data.items) {
          setCustomers(data.items);
        } else {
          setCustomers([]); // Ensure state is empty if no customers found
        }
      } catch (err: any) {
        setError(`Error fetching customers: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, companyName: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/netsuite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCustomers(prev => [...prev, data]);
      setNewCustomer({ companyName: '', subsidiary: { id: '1', refName: 'Parent Company' } });
      setSuccessMessage(`Customer "${data.companyName}" added successfully with ID: ${data.id}`);
    } catch (err: any) {
      setError(`Error creating customer: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>NetSuite Customers</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="companyName"
          value={newCustomer.companyName}
          onChange={handleInputChange}
          placeholder="Company Name"
          required
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          Add Customer
        </button>
      </form>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      <h2>Customer List</h2>
      {customers.length === 0 ? (
        <p>No customers available.</p>
      ) : (
        <ul className={styles.customerList}>
          {customers.map((customer) => (
            <li key={customer.id} className={styles.customerItem}>
              ID: {customer.id} |{' '}
              {customer.links && customer.links.length > 0 ? (
                <a 
                  href={customer.links[0].href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.customerLink}
                >
                  Details
                </a>
              ) : (
                'No Links Available'
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
