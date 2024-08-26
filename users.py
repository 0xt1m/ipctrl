import argparse
import hashlib
import sqlite3
import sys

USERS_DB_PATH = "./instance/users.db"

def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

def add_user(username, password):
    hashed_password = hash_password(password)
    conn = sqlite3.connect(USERS_DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    ''')

    try:
        cursor.execute('''
            INSERT INTO user (id, password)
            VALUES (?, ?)
        ''', (username, hashed_password))
        conn.commit()
        print(f'User "{username}" added successfully.')
    except sqlite3.IntegrityError:
        print(f'Error: User "{username}" already exists.')
    
    conn.close()

def remove_user(username):
    conn = sqlite3.connect(USERS_DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM user WHERE id = ?
    ''', (username,))
    
    if cursor.rowcount == 0:
        print(f'Error: User "{username}" does not exist.')
    else:
        conn.commit()
        print(f'User "{username}" removed successfully.')
    
    conn.close()

def change_password(username, new_password):
    hashed_password = hash_password(new_password)
    conn = sqlite3.connect(USERS_DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE user
        SET password = ?
        WHERE id = ?
    ''', (hashed_password, username))
    
    if cursor.rowcount == 0:
        print(f'Error: User "{username}" does not exist.')
    else:
        conn.commit()
        print(f'Password for user "{username}" changed successfully.')
    
    conn.close()

def list_users():
    conn = sqlite3.connect(USERS_DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id FROM user')
    users = cursor.fetchall()
    
    if users:
        print("Existing users:")
        for user in users:
            print(user[0])
    else:
        print("No users found.")
    
    conn.close()

def main():
    parser = argparse.ArgumentParser(description='Manage users in the database.')
    subparsers = parser.add_subparsers(dest='command', help='Sub-commands: add, remove, change-password, list')
    
    # Add user command
    parser_add = subparsers.add_parser('add', aliases=['a'], help='Add a new user')
    parser_add.add_argument('-u', '--username', type=str, required=True, help='Username of the new user')
    parser_add.add_argument('-p', '--password', type=str, required=True, help='Password of the new user')
    
    # Remove user command
    parser_remove = subparsers.add_parser('remove', aliases=['r'], help='Remove an existing user')
    parser_remove.add_argument('-u', '--username', type=str, required=True, help='Username of the user to remove')
    
    # Change password command
    parser_change_password = subparsers.add_parser('change-password', aliases=['cp'], help='Change the password of an existing user')
    parser_change_password.add_argument('-u', '--username', type=str, required=True, help='Username of the user')
    parser_change_password.add_argument('-p', '--password', type=str, required=True, help='New password for the user')
    
    # List users command
    parser_list = subparsers.add_parser('list', aliases=['l'], help='List all existing users')
    
    args = parser.parse_args()
    
    if args.command in ['add', 'a']:
        add_user(args.username, args.password)
    elif args.command in ['remove', 'r']:
        remove_user(args.username)
    elif args.command in ['change-password', 'cp']:
        change_password(args.username, args.password)
    elif args.command in ['list', 'l']:
        list_users()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()